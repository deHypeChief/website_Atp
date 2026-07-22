/* eslint-disable react/prop-types */
import { AtpButton, PageHero } from "../system/system";
export default function Hero({title,subTitle,text,noAction,imageUrl,altText,altLink}){const actions=noAction?null:<><AtpButton to="/signup">Get started</AtpButton><AtpButton to={altLink||"/about"} variant="ghost">{altText||"Learn more"}</AtpButton></>;return <PageHero compact eyebrow={subTitle||"ATP International"} title={title} text={text||"Train with purpose, compete with confidence and belong to a tennis community built around your game."} image={imageUrl} actions={actions}/>}
