/**
 * The ATP membership tiers.
 *
 * One list feeds both the player's billing page and the public home page, so a price or a
 * benefit only has to be changed in one place to be right in both. `duration` is the key
 * the payment endpoint expects, and "" marks the tier that is never charged for.
 */
export const MEMBERSHIP_PLANS = [
  {
    title: "Free Plan",
    priceNGN: 0,
    priceUSD: 0,
    duration: "",
    extra: "",
    content: [
      "Access to Dashboard",
      "Access to ATP Tournaments Page",
      "Join Free WhatsApp Community",
      "Join Premium WhatsApp Community",
      "Access to Progress Tracker",
      "Training / Coaching Discounts",
      "1 Free Training / Quarter",
      "Exclusive Social Events",
      "Tournament Priority Access & 5% Discount",
      "Premium Badge on Dashboard",
    ],
  },
  {
    title: "Premium Monthly",
    extra: "",
    priceNGN: 6000,
    priceUSD: 5,
    duration: "monthly",
    content: [
      "Access to Dashboard",
      "Access to ATP Tournaments Page",
      "Join Free WhatsApp Community",
      "Join Premium WhatsApp Community",
      "Access to Progress Tracker",
      "Training / Coaching Discounts",
      "No Free Training / Quarter",
      "Exclusive Social Events",
      "Tournament Priority Access & 5% Discount",
      "Premium Badge on Dashboard",
    ],
  },
  {
    title: "Premium Quarterly",
    extra: "Save 17% on this plan",
    priceNGN: 15000,
    priceUSD: 10,
    duration: "quarterly",
    content: [
      "Access to Dashboard",
      "Access to ATP Tournaments Page",
      "Join Free WhatsApp Community",
      "Join Premium WhatsApp Community",
      "Access to Progress Tracker",
      "Training / Coaching Discounts",
      "1 Free Training / Quarter",
      "Exclusive Social Events",
      "Tournament Priority Access & 5% Discount",
      "Premium Badge on Dashboard",
    ],
  },
  {
    title: "Premium Yearly",
    extra: "Save 3% on this plan",
    priceNGN: 70000,
    priceUSD: 50,
    duration: "yearly",
    content: [
      "Access to Dashboard",
      "Access to ATP Tournaments Page",
      "Join Free WhatsApp Community",
      "Join Premium WhatsApp Community",
      "Access to Progress Tracker",
      "Training / Coaching Discounts",
      "1 Free Training / Quarter",
      "Exclusive Social Events",
      "Tournament Priority Access & 5% Discount",
      "Premium Badge on Dashboard",
    ],
  },
];

/** Benefits from this position on are the paid extras the free tier does not include. */
export const FREE_PLAN_INCLUDED = 3;

/** How long a tier runs, for the price line. */
export const DURATION_SUFFIX = { monthly: "/ month", quarterly: "/ quarter", yearly: "/ year" };

/**
 * Whether a tier actually grants a benefit.
 *
 * The free tier only carries the opening benefits, and any plan can spell out an absence
 * in the benefit itself ("No Free Training / Quarter"), which is the same thing.
 */
export const perkIncluded = (plan, index) =>
  !String(plan.content[index] || "").startsWith("No ") &&
  (plan.duration !== "" || index < FREE_PLAN_INCLUDED);

/** True while a session is stored. The dashboard re-checks the token on arrival. */
export const isSignedIn = () => Boolean(localStorage.getItem("user-payload"));

/** What the payment summary needs to charge for a membership tier. */
export const membershipPayload = (plan) => ({
  key: plan.duration,
  type: "Membership Package",
  plan: plan.title,
  price: plan.priceNGN,
  duration: plan.duration,
});

/**
 * Route to the billing page with the payment summary already open on a chosen plan.
 *
 * A visitor is sent through signup first and returned to the same summary, so the choice
 * survives the detour instead of dropping them on the dashboard.
 */
export function billingCheckoutPath(payload) {
  const target = `/u/billings?pay=${encodeURIComponent(JSON.stringify(payload))}`;
  return isSignedIn() ? target : `/signup?redirect=${encodeURIComponent(target)}`;
}
