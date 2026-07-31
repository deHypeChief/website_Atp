/**
 * Every piece of editable website copy is declared here once. The admin form is generated
 * from this list and the client reads resolved values by key, so adding a new editable
 * string means adding one entry — no schema change, no admin form change.
 *
 * `default` is the copy the site ships with; it renders until an admin overrides it.
 * `legacy` points at the old flat `pages.*` field so values entered before this registry
 * existed keep showing up.
 *
 * Line breaks: use \n where the design renders a hard break (the client converts them).
 */

export type CopyFieldType = "heading" | "text";

export interface CopyField {
    key: string;
    label: string;
    type: CopyFieldType;
    default: string;
    legacy?: string;
}

export interface CopyGroup {
    id: string;
    label: string;
    fields: CopyField[];
}

export const COPY_GROUPS: CopyGroup[] = [
    {
        id: "home",
        label: "Home page",
        fields: [
            { key: "home.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "Amateur Tennis Pro · Abuja" },
            { key: "home.hero.title", label: "Hero title", type: "heading", default: "Own the court.\nBuild your game.", legacy: "homePageTitle" },
            { key: "home.hero.text", label: "Hero text", type: "text", default: "Training, competition and a tennis community built for every level of ambition." },
            { key: "home.hero.primaryCta", label: "Hero primary button", type: "heading", default: "Join the club" },
            { key: "home.hero.secondaryCta", label: "Hero secondary button", type: "heading", default: "Find training" },

            { key: "home.stats.players.value", label: "Stat 1 value", type: "heading", default: "500+" },
            { key: "home.stats.players.label", label: "Stat 1 label", type: "heading", default: "active players" },
            { key: "home.stats.coaches.value", label: "Stat 2 value", type: "heading", default: "20+" },
            { key: "home.stats.coaches.label", label: "Stat 2 label", type: "heading", default: "ATP coaches" },
            { key: "home.stats.events.value", label: "Stat 3 value", type: "heading", default: "12" },
            { key: "home.stats.events.label", label: "Stat 3 label", type: "heading", default: "annual events" },
            { key: "home.stats.home.value", label: "Stat 4 value", type: "heading", default: "Abuja" },
            { key: "home.stats.home.label", label: "Stat 4 label", type: "heading", default: "home court" },

            { key: "home.intro.eyebrow", label: "Intro eyebrow", type: "heading", default: "Built around the player" },
            { key: "home.intro.title", label: "Intro title", type: "heading", default: "More than a place to hit balls.", legacy: "homePageAboutTitle" },
            { key: "home.intro.text", label: "Intro text", type: "text", default: "ATP combines structured training, real competition and a welcoming club culture so every player has a clear next step.", legacy: "homePageAboutText" },
            { key: "home.intro.cta", label: "Intro button", type: "heading", default: "Meet ATP" },

            { key: "home.programs.performance.eyebrow", label: "Program 1 eyebrow", type: "heading", default: "Performance track" },
            { key: "home.programs.performance.title", label: "Program 1 title", type: "heading", default: "Train with intent" },
            { key: "home.programs.performance.text", label: "Program 1 text", type: "text", default: "Structured sessions for players ready to build technique, movement and match confidence." },
            { key: "home.programs.junior.eyebrow", label: "Program 2 eyebrow", type: "heading", default: "Junior pathway" },
            { key: "home.programs.junior.title", label: "Program 2 title", type: "heading", default: "Start them strong" },
            { key: "home.programs.junior.text", label: "Program 2 text", type: "text", default: "Age-aware coaching that makes every lesson active, safe and genuinely fun." },
            { key: "home.programs.clubhouse.eyebrow", label: "Program 3 eyebrow", type: "heading", default: "The clubhouse" },
            { key: "home.programs.clubhouse.title", label: "Program 3 title", type: "heading", default: "Find your people" },
            { key: "home.programs.clubhouse.text", label: "Program 3 text", type: "text", default: "Talk tennis, challenge your instincts and stay connected beyond the final point." },

            { key: "home.feature.eyebrow", label: "Coaching band eyebrow", type: "heading", default: "PLAY WITH A PLAN" },
            { key: "home.feature.title", label: "Coaching band title", type: "heading", default: "A better game starts with better feedback.", legacy: "homePageCoachTitle" },
            { key: "home.feature.text", label: "Coaching band text", type: "text", default: "Work with coaches who meet you at your level, then build every session around where you want to go.", legacy: "homePageCoachText" },
            { key: "home.feature.cta", label: "Coaching band button", type: "heading", default: "Explore coaching" },
            { key: "home.feature.metricOneValue", label: "Coaching metric 1 value", type: "heading", default: "1:1" },
            { key: "home.feature.metricOneLabel", label: "Coaching metric 1 label", type: "heading", default: "Personal coaching" },
            { key: "home.feature.metricTwoValue", label: "Coaching metric 2 value", type: "heading", default: "All" },
            { key: "home.feature.metricTwoLabel", label: "Coaching metric 2 label", type: "heading", default: "Skill levels" },

            { key: "home.tournaments.eyebrow", label: "Tournaments eyebrow", type: "heading", default: "Competition calendar" },
            { key: "home.tournaments.title", label: "Tournaments title", type: "heading", default: "Put your game in play." },
            { key: "home.tournaments.text", label: "Tournaments text", type: "text", default: "Club tournaments turn training into match experience—competitive, organised and open to ATP players." },
            { key: "home.tournaments.cta", label: "Tournaments button", type: "heading", default: "All tournaments" },
            { key: "home.tournaments.empty", label: "Tournaments empty state", type: "text", default: "The next tournament draw is being prepared." },

            { key: "home.membership.eyebrow", label: "Membership eyebrow", type: "heading", default: "Membership" },
            { key: "home.membership.title", label: "Membership title", type: "heading", default: "Choose how you play." },
            { key: "home.membership.text", label: "Membership text", type: "text", default: "Start free. Move up when you want more training, access and club benefits." },
            { key: "home.membership.free.name", label: "Plan 1 name", type: "heading", default: "Open court" },
            { key: "home.membership.free.price", label: "Plan 1 price", type: "heading", default: "Free" },
            { key: "home.membership.free.text", label: "Plan 1 text", type: "text", default: "A player account, tournaments and the public ATP community." },
            { key: "home.membership.club.name", label: "Plan 2 name", type: "heading", default: "Club player" },
            { key: "home.membership.club.price", label: "Plan 2 price", type: "heading", default: "₦6K" },
            { key: "home.membership.club.suffix", label: "Plan 2 price suffix", type: "heading", default: "/ month" },
            { key: "home.membership.club.text", label: "Plan 2 text", type: "text", default: "Training benefits, member events and priority tournament access." },
            { key: "home.membership.season.name", label: "Plan 3 name", type: "heading", default: "Season player" },
            { key: "home.membership.season.price", label: "Plan 3 price", type: "heading", default: "₦15K" },
            { key: "home.membership.season.suffix", label: "Plan 3 price suffix", type: "heading", default: "/ quarter" },
            { key: "home.membership.season.text", label: "Plan 3 text", type: "text", default: "The complete club experience with better long-term value." },

            { key: "home.youth.eyebrow", label: "Junior band eyebrow", type: "heading", default: "Junior tennis" },
            { key: "home.youth.title", label: "Junior band title", type: "heading", default: "Confidence starts here." },
            { key: "home.youth.text", label: "Junior band text", type: "text", default: "Our junior pathway gives young players the coaching, movement skills and encouragement to enjoy the game for life." },
            { key: "home.youth.cta", label: "Junior band button", type: "heading", default: "Junior programs" },
            { key: "home.youth.badgeValue", label: "Junior badge value", type: "heading", default: "8–17" },
            { key: "home.youth.badgeLabel", label: "Junior badge label", type: "heading", default: "Age-aware development" },

            { key: "home.community.eyebrow", label: "Community eyebrow", type: "heading", default: "THE ATP CLUBHOUSE" },
            { key: "home.community.title", label: "Community title", type: "heading", default: "Tennis is better\nwith people." },
            { key: "home.community.text", label: "Community text", type: "text", default: "Join the conversation, answer the weekly challenge and keep the match going." },
            { key: "home.community.cta", label: "Community button", type: "heading", default: "Enter community" },

            { key: "home.stories.eyebrow", label: "News eyebrow", type: "heading", default: "Courtside notes" },
            { key: "home.stories.title", label: "News title", type: "heading", default: "Fresh from the baseline." },
            { key: "home.stories.cta", label: "News button", type: "heading", default: "All stories" },

            { key: "home.newsletter.eyebrow", label: "Newsletter eyebrow", type: "heading", default: "ATP / COURTSIDE" },
            { key: "home.newsletter.title", label: "Newsletter title", type: "heading", default: "Stay close\nto the game." },
            { key: "home.newsletter.label", label: "Newsletter label", type: "text", default: "Tournament news, training notes and club updates." },
        ],
    },
    {
        id: "about",
        label: "About page",
        fields: [
            { key: "about.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "The ATP story" },
            { key: "about.hero.title", label: "Hero title", type: "heading", default: "Built for the\nlove of tennis." },
            { key: "about.hero.text", label: "Hero text", type: "text", default: "An Abuja tennis community where serious coaching, healthy competition and genuine belonging meet." },
            { key: "about.hero.cta", label: "Hero button", type: "heading", default: "Join ATP" },
            { key: "about.manifesto.eyebrow", label: "Purpose eyebrow", type: "heading", default: "Our purpose" },
            { key: "about.manifesto.title", label: "Purpose statement", type: "text", default: "Make the game accessible. Make every session count. Make every player feel they belong." },
            { key: "about.story.eyebrow", label: "Story eyebrow", type: "heading", default: "Who we are" },
            { key: "about.story.title", label: "Story heading", type: "heading", default: "A club with a clear point of view.", legacy: "aboutStoryHeader" },
            { key: "about.story.text", label: "Story text", type: "text", default: "ATP is built around the belief that tennis is more than a sport. It is a lifelong practice of movement, focus and confidence. We connect beginners, developing juniors and experienced competitors with coaching and match play designed around their next step.", legacy: "aboutStoryText" },
            { key: "about.story.textSecondary", label: "Story second paragraph", type: "text", default: "From structured sessions to club tournaments, the experience is welcoming, ambitious and unmistakably local." },
            { key: "about.story.badgeValue", label: "Story badge value", type: "heading", default: "Every level" },
            { key: "about.story.badgeLabel", label: "Story badge label", type: "heading", default: "One tennis community" },
            { key: "about.vision.eyebrow", label: "Vision eyebrow", type: "heading", default: "OUR VISION" },
            { key: "about.vision.title", label: "Vision heading", type: "heading", default: "Tennis within reach.", legacy: "aboutVisionHeader" },
            { key: "about.vision.text", label: "Vision text", type: "text", default: "A thriving African tennis culture where anyone with the desire to play can find a court, a coach and a community.", legacy: "aboutVisionText" },
            { key: "about.mission.eyebrow", label: "Mission eyebrow", type: "heading", default: "OUR MISSION" },
            { key: "about.mission.title", label: "Mission heading", type: "heading", default: "Progress with purpose.", legacy: "aboutMissionHeader" },
            { key: "about.mission.text", label: "Mission text", type: "text", default: "Build confident players through excellent coaching, meaningful competition and enduring connections on and off court.", legacy: "aboutMissionText" },
            { key: "about.cta.eyebrow", label: "Closing eyebrow", type: "heading", default: "YOUR NEXT POINT STARTS HERE" },
            { key: "about.cta.title", label: "Closing title", type: "heading", default: "Come find your game." },
            { key: "about.cta.button", label: "Closing button", type: "heading", default: "Talk to ATP" },
        ],
    },
    {
        id: "coaching",
        label: "Coaching page",
        fields: [
            { key: "coaching.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "ATP coaching" },
            { key: "coaching.hero.title", label: "Hero title", type: "heading", default: "Train with\na clear plan." },
            { key: "coaching.hero.text", label: "Hero text", type: "text", default: "Find a coach who understands your level, your ambition and the work between the two." },
            { key: "coaching.hero.cta", label: "Hero button", type: "heading", default: "Start training" },
            { key: "coaching.method.eyebrow", label: "Method eyebrow", type: "heading", default: "The ATP method" },
            { key: "coaching.method.title", label: "Method title", type: "heading", default: "Feedback you can use." },
            { key: "coaching.method.text", label: "Method text", type: "text", default: "Every programme connects technique, movement and match decisions—so improvement carries from the training court into competition." },
            { key: "coaching.method.stepOneTitle", label: "Step 1 title", type: "heading", default: "Assess" },
            { key: "coaching.method.stepOneText", label: "Step 1 text", type: "text", default: "Start with the player you are today." },
            { key: "coaching.method.stepTwoTitle", label: "Step 2 title", type: "heading", default: "Build" },
            { key: "coaching.method.stepTwoText", label: "Step 2 text", type: "text", default: "Train the details that unlock your game." },
            { key: "coaching.method.stepThreeTitle", label: "Step 3 title", type: "heading", default: "Compete" },
            { key: "coaching.method.stepThreeText", label: "Step 3 text", type: "text", default: "Turn practice into confident decisions." },
            { key: "coaching.roster.eyebrow", label: "Roster eyebrow", type: "heading", default: "Meet the team" },
            { key: "coaching.roster.title", label: "Roster title", type: "heading", default: "Coaches behind the progress." },
            { key: "coaching.roster.text", label: "Roster text", type: "text", default: "Choose a profile to learn more about their experience and coaching focus." },
            { key: "coaching.roster.loading", label: "Roster loading state", type: "text", default: "Preparing the coaching team…" },
            { key: "coaching.roster.empty", label: "Roster empty state", type: "text", default: "Coach profiles are being prepared." },
        ],
    },
    {
        id: "membership",
        label: "Membership pages",
        fields: [
            { key: "membership.hero.text", label: "Hero text (all plans)", type: "text", default: "Choose a plan, pair with a coach and build a routine that keeps your game moving." },
            { key: "membership.children.title", label: "Junior hero title", type: "heading", default: "A strong start\nfor young players." },
            { key: "membership.adult.title", label: "Adult hero title", type: "heading", default: "Make tennis\npart of your week." },
            { key: "membership.combo.title", label: "Combo hero title", type: "heading", default: "Train together.\nGrow together." },
            { key: "membership.step.plan.title", label: "Step 1 title", type: "heading", default: "Choose how you want to play." },
            { key: "membership.step.plan.text", label: "Step 1 text", type: "text", default: "Every plan connects you to the ATP community. Select the level of coaching and access that fits your goals." },
            { key: "membership.step.coach.eyebrow", label: "Step 2 eyebrow", type: "heading", default: "PERSONAL SUPPORT" },
            { key: "membership.step.coach.title", label: "Step 2 title", type: "heading", default: "Pick your coach." },
            { key: "membership.step.coach.text", label: "Step 2 text", type: "text", default: "Choose the coaching profile that best matches your plan and the way you want to develop." },
            { key: "membership.step.duration.eyebrow", label: "Step 3 eyebrow", type: "heading", default: "COMMITMENT" },
            { key: "membership.step.duration.title", label: "Step 3 title", type: "heading", default: "Set your training rhythm." },
            { key: "membership.step.duration.text", label: "Step 3 text", type: "text", default: "Longer plans reward consistency with better value." },
            { key: "membership.empty.plans", label: "No plans message", type: "text", default: "Membership plans are being prepared." },
            { key: "membership.empty.coaches", label: "No coaches message", type: "text", default: "No matching coaches are available yet." },
        ],
    },
    {
        id: "tournaments",
        label: "Tournaments page",
        fields: [
            { key: "tournaments.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "ATP competition" },
            { key: "tournaments.hero.title", label: "Hero title", type: "heading", default: "Put your game\non the line." },
            { key: "tournaments.hero.text", label: "Hero text", type: "text", default: "Organised match play for juniors and adults who want the focus, energy and growth that only competition brings." },
            { key: "tournaments.hero.cta", label: "Hero button", type: "heading", default: "Enter a tournament" },
            { key: "tournaments.calendar.eyebrow", label: "Calendar eyebrow", type: "heading", default: "Competition calendar" },
            { key: "tournaments.calendar.title", label: "Calendar title", type: "heading", default: "Your next match starts here." },
            { key: "tournaments.calendar.text", label: "Calendar text", type: "text", default: "Choose an event that fits your level. ATP members can register from their player dashboard." },
            { key: "tournaments.archive.eyebrow", label: "Archive eyebrow", type: "heading", default: "Championship archive" },
            { key: "tournaments.archive.title", label: "Archive title", type: "heading", default: "Earned on court." },
            { key: "tournaments.archive.text", label: "Archive text", type: "text", default: "Every draw leaves a record. Meet the champions and finalists who raised the standard." },
            { key: "tournaments.entry.eyebrow", label: "How to enter eyebrow", type: "heading", default: "How to enter" },
            { key: "tournaments.entry.title", label: "How to enter title", type: "heading", default: "Four steps to match day." },
            { key: "tournaments.entry.stepOne", label: "Entry step 1", type: "heading", default: "Create your account" },
            { key: "tournaments.entry.stepTwo", label: "Entry step 2", type: "heading", default: "Choose membership" },
            { key: "tournaments.entry.stepThree", label: "Entry step 3", type: "heading", default: "Book your tournament" },
            { key: "tournaments.entry.stepFour", label: "Entry step 4", type: "heading", default: "Show up ready" },
        ],
    },
    {
        id: "contact",
        label: "Contact page",
        fields: [
            { key: "contact.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "TALK TO ATP" },
            { key: "contact.hero.title", label: "Hero title", type: "heading", default: "Let’s get you\non court." },
            { key: "contact.hero.location", label: "Location line", type: "heading", default: "Abuja, Nigeria" },
            { key: "contact.hero.email", label: "Contact email", type: "heading", default: "admin@atpinternational.org" },
            { key: "contact.form.eyebrow", label: "Form eyebrow", type: "heading", default: "START HERE" },
            { key: "contact.form.title", label: "Form title", type: "heading", default: "What can we help with?" },
            { key: "contact.intent.play.title", label: "Option 1 title", type: "heading", default: "I want to play" },
            { key: "contact.intent.play.text", label: "Option 1 text", type: "text", default: "Training, membership or tournaments" },
            { key: "contact.intent.coach.title", label: "Option 2 title", type: "heading", default: "I want to coach" },
            { key: "contact.intent.coach.text", label: "Option 2 text", type: "text", default: "Join the ATP coaching team" },
            { key: "contact.intent.support.title", label: "Option 3 title", type: "heading", default: "I need support" },
            { key: "contact.intent.support.text", label: "Option 3 text", type: "text", default: "Help with my account or booking" },
            { key: "contact.form.submit", label: "Submit button", type: "heading", default: "Open email" },
            { key: "contact.form.note", label: "Form note", type: "text", default: "This opens your email app with the enquiry prepared." },
        ],
    },
    {
        id: "videos",
        label: "Video room page",
        fields: [
            { key: "videos.hero.eyebrow", label: "Hero eyebrow", type: "heading", default: "ATP video room" },
            { key: "videos.hero.title", label: "Hero title", type: "heading", default: "Learn. Rewatch.\nTake it to court." },
            { key: "videos.hero.text", label: "Hero text", type: "text", default: "Short, practical lessons designed to make the next training session more useful." },
            { key: "videos.hero.cta", label: "Hero button", type: "heading", default: "Train with a coach" },
            { key: "videos.library.eyebrow", label: "Library eyebrow", type: "heading", default: "Instructional library" },
            { key: "videos.library.title", label: "Library title", type: "heading", default: "Start with one detail." },
            { key: "videos.library.text", label: "Library text", type: "text", default: "Choose a lesson, take one cue to court and repeat until it feels natural." },
            { key: "videos.note.eyebrow", label: "Closing eyebrow", type: "heading", default: "MORE LESSONS ARE COMING" },
            { key: "videos.note.title", label: "Closing title", type: "heading", default: "A library that grows with your game." },
            { key: "videos.note.cta", label: "Closing button", type: "heading", default: "Request a topic" },
        ],
    },
];

export const COPY_FIELDS: CopyField[] = COPY_GROUPS.flatMap(group => group.fields);
export const COPY_KEYS = new Set(COPY_FIELDS.map(field => field.key));
export const COPY_DEFAULTS: Record<string, string> = Object.fromEntries(
    COPY_FIELDS.map(field => [field.key, field.default]),
);

// Placeholder copy left over from the original template should never win over a real default.
const isUsable = (value?: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0 && !/lorem ipsum|cras tincidunt/i.test(value);

/**
 * Resolves every registered key to the value the site should render:
 * admin override, then the legacy flat `pages.*` value, then the shipped default.
 */
export const resolveCopy = (
    overrides: Record<string, unknown> = {},
    legacyPages: Record<string, unknown> = {},
): Record<string, string> => {
    const resolved: Record<string, string> = {};
    for (const field of COPY_FIELDS) {
        const override = overrides[field.key];
        if (isUsable(override)) { resolved[field.key] = override; continue; }
        const legacy = field.legacy ? legacyPages[field.legacy] : undefined;
        resolved[field.key] = isUsable(legacy) ? legacy : field.default;
    }
    return resolved;
};
