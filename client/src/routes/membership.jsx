/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getCoaches, getPlans } from "../libs/api/api.endpoints";
import { useCopy, Lines } from "../libs/hooks/use-copy";
import { PageHero } from "../components/system/system";
import { billingCheckoutPath, isSignedIn } from "../libs/membership-plans";
import adultImage from "../assets/brand/pro-serve.jpg";
import childrenImage from "../assets/brand/youth-training.jpg";
import comboImage from "../assets/brand/club-community.jpg";

const money=value=>`₦${Number(value||0).toLocaleString()}`;
const termLabel=months=>months===1?"per month":`for ${months} months`;

/**
 * Splits the packages into the ones this page is for and the special ones.
 *
 * Special plans cover more than one player, so they are worth seeing from every page
 * rather than only from /membership/combo. When an admin has not assigned anything to
 * this page yet, the main group falls back to every standard plan so the page still sells.
 */
function planGroups(plans,type){
  const mine=plans.filter(item=>item.audience===type);
  const main=mine.length?mine:plans.filter(item=>!item.isSpecial);
  const extras=plans.filter(item=>item.isSpecial&&!main.includes(item));
  return {main,extras};
}

function PlanCard({item,selected,onSelect}){
  const opening=item.billingPlans[0];
  // The headline is the shortest term; the rows below it are the longer commitments, so
  // no figure is printed twice.
  const longer=item.billingPlans.slice(1);
  return <button type="button" className={`planCard${selected?" isSelected":""}`} aria-pressed={selected} onClick={onSelect}>
    {item.planImage&&<img className="planShot" src={item.planImage} alt=""/>}
    <span className="planTag">{item.planLabel}</span>
    <h3>{item.planName}</h3>
    <p className="planRate"><strong>{item.planPrice?money(item.planPrice):"Coach priced"}</strong>{opening&&item.planPrice?<em>{termLabel(opening.interval)}</em>:null}</p>
    <p className="planText">{item.description}</p>
    {longer.length>0&&<ul className="planTerms">{longer.map(tier=><li key={tier._id}><span>{tier.interval} months</span><strong>{money(tier.billingPrice)}</strong></li>)}</ul>}
    <span className="planPick">{selected?"Selected":"Select plan"}<Icon icon={selected?"solar:check-circle-bold":"solar:arrow-right-linear"}/></span>
  </button>;
}

export function MembershipAction({planData=[],type="adult"}){
  const copy=useCopy();
  const navigate=useNavigate();
  const [step,setStep]=useState(0);
  const [plan,setPlan]=useState(null);
  const [coach,setCoach]=useState(null);
  const [billingIndex,setBillingIndex]=useState(0);
  const {data:coaches=[]}=useQuery({queryKey:["coachesMem"],queryFn:getCoaches});
  const {main,extras}=useMemo(()=>planGroups(planData,type),[planData,type]);
  const filteredCoaches=useMemo(()=>{
    if(!plan)return[];
    // A plan can pin an explicit set of coaches; when it does, that list wins outright.
    const ids=Array.isArray(plan.coachIds)?plan.coachIds:[];
    if(ids.length)return coaches.filter(item=>ids.includes(String(item._id)));
    const levels=Array.isArray(plan.filterPrams)?plan.filterPrams:[];
    return levels.length?coaches.filter(item=>levels.includes(item.level)):coaches;
  },[coaches,plan]);

  const billing=plan?.billingPlans?.[billingIndex];
  const months=billing?.interval||1;
  const discount=billing?.discountPercentage||0;
  const planTotal=billing?.billingPrice??((plan?.planPrice||0)*months*(1-discount/100));
  const total=planTotal+((coach?.price||0)*months);

  const signedIn=isSignedIn();

  const choosePlan=item=>{setPlan(item);setBillingIndex(0);setCoach(null)};

  /**
   * Hands the chosen package to the billing page's payment summary, which is the same
   * checkout a player gets from their dashboard. A visitor signs up first and is returned
   * to the same summary, so the selection survives the detour.
   */
  const continueToCheckout=()=>{
    const payload={
      key:plan?.slug,
      type:"Training Package",
      plan:plan?.planName,
      price:(plan?.billingPlans||[]).map(tier=>({months:tier.interval,price:tier.billingPrice,dollarPrice:tier.dollarPrice||0})),
      planType:billingIndex,
      duration:`${months} Month${months===1?"":"s"}`,
      message:plan?.description,
    };
    navigate(billingCheckoutPath(payload));
  };

  return <section className="membershipBuilder pagePad">
    <header>
      <span>STEP {step+1} OF 3</span>
      <div>{["Choose plan","Choose coach","Set duration"].map((label,index)=>
        <button key={label} className={step===index?"active":step>index?"done":""} onClick={()=>index<step&&setStep(index)}>
          <i>{step>index?<Icon icon="solar:check-circle-bold"/>:index+1}</i>{label}
        </button>)}
      </div>
    </header>

    {step===0&&<div className="membershipStep">
      <div>
        <small>{type.toUpperCase()} MEMBERSHIP</small>
        <h2>{copy("membership.step.plan.title","Choose how you want to play.")}</h2>
        <p>{copy("membership.step.plan.text","Every plan connects you to the ATP community. Select the level of coaching and access that fits your goals.")}</p>
      </div>
      {!planData.length?<p className="pageState">{copy("membership.empty.plans","Membership plans are being prepared.")}</p>:
      <div className="planGroups">
        <section>
          <div className="planChoiceGrid">{main.map(item=>
            <PlanCard key={item._id} item={item} selected={plan?._id===item._id} onSelect={()=>choosePlan(item)}/>)}
          </div>
        </section>
        {extras.length>0&&<section>
          <header className="planGroupHead">
            <h3>{copy("membership.special.title","Special plans")}</h3>
            <p>{copy("membership.special.text","Built for more than one player — families and couples train on a single plan.")}</p>
          </header>
          <div className="planChoiceGrid">{extras.map(item=>
            <PlanCard key={item._id} item={item} selected={plan?._id===item._id} onSelect={()=>choosePlan(item)}/>)}
          </div>
        </section>}
      </div>}
    </div>}

    {step===1&&<div className="membershipStep">
      <div>
        <small>{copy("membership.step.coach.eyebrow","PERSONAL SUPPORT")}</small>
        <h2>{copy("membership.step.coach.title","Pick your coach.")}</h2>
        <p>{copy("membership.step.coach.text","Choose the coaching profile that best matches your plan and the way you want to develop.")}</p>
      </div>
      <div className="coachChoiceGrid">
        {filteredCoaches.map(item=>
          <button key={item._id} className={coach?._id===item._id?"selected":""} onClick={()=>setCoach(item)}>
            {item.imageUrl?<img src={item.imageUrl} alt={item.coachName}/>:<span>{item.coachName?.charAt(0)}</span>}
            <div><h3>{item.coachName}</h3>{item.bioInfo&&<p>{item.bioInfo}</p>}</div>
            <Icon icon={coach?._id===item._id?"solar:check-circle-bold":"solar:arrow-right-linear"}/>
          </button>)}
        {!filteredCoaches.length&&<p className="pageState">{copy("membership.empty.coaches","No matching coaches are available yet.")}</p>}
      </div>
    </div>}

    {step===2&&<div className="membershipStep">
      <div>
        <small>{copy("membership.step.duration.eyebrow","COMMITMENT")}</small>
        <h2>{copy("membership.step.duration.title","Set your training rhythm.")}</h2>
        <p>{copy("membership.step.duration.text","Longer plans reward consistency with better value.")}</p>
      </div>
      <div className="durationChoiceGrid">
        {(plan?.billingPlans||[]).map((item,index)=>
          <button key={item._id||index} className={billingIndex===index?"selected":""} onClick={()=>setBillingIndex(index)}>
            <span>{item.interval} month{item.interval===1?"":"s"}</span>
            <strong>{item.billingPrice?money(item.billingPrice):item.discountPercentage?`${item.discountPercentage}% off`:"Standard rate"}</strong>
            <Icon icon={billingIndex===index?"solar:check-circle-bold":"solar:calendar-linear"}/>
          </button>)}
        <aside>
          <small>YOUR MEMBERSHIP</small>
          <h3>{plan?.planName}</h3>
          <p>{coach?.coachName||"ATP coach"} · {months} month{months===1?"":"s"}</p>
          <strong>{money(total)}</strong>
          {plan?.priceInfo&&<small className="planNote">{plan.priceInfo}</small>}
        </aside>
      </div>
    </div>}

    <footer>
      <button type="button" onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0}><Icon icon="solar:arrow-left-linear"/> Back</button>
      {step<2
        ?<button type="button" className="primary" disabled={(step===0&&!plan)||(step===1&&!coach)} onClick={()=>setStep(step+1)}>Continue <Icon icon="solar:arrow-right-linear"/></button>
        :<button type="button" className="primary" disabled={!billing} onClick={continueToCheckout}>{signedIn?"Continue to payment":"Create account & continue"} <Icon icon="solar:arrow-right-up-linear"/></button>}
    </footer>
  </section>;
}

function MembershipPage({type,titleKey,titleFallback,image}){
  const copy=useCopy();
  const {data:plans=[]}=useQuery({queryKey:["membershipPlans"],queryFn:getPlans});
  return <main className="editorialPage membershipV3">
    <PageHero eyebrow={`${type} membership`} title={<Lines>{copy(titleKey,titleFallback)}</Lines>}
      text={copy("membership.hero.text","Choose a plan, pair with a coach and build a routine that keeps your game moving.")} image={image} compact/>
    <MembershipAction planData={plans} type={type}/>
  </main>;
}

export function ChildrenMembership(){return <MembershipPage type="children" titleKey="membership.children.title" titleFallback={"A strong start\nfor young players."} image={childrenImage}/>}
export function AdultMembership(){return <MembershipPage type="adult" titleKey="membership.adult.title" titleFallback={"Make tennis\npart of your week."} image={adultImage}/>}
export function ComboMembership(){return <MembershipPage type="combo" titleKey="membership.combo.title" titleFallback={"Train together.\nGrow together."} image={comboImage}/>}
