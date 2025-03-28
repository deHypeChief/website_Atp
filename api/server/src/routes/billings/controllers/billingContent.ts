export const BillingConfig = {
    registration: {
        price: 25000,
        benifits: [
            `For ATP training/coaching packages, registered members get to enjoy discount. (5% for monthly membership; 7% for quarterly membership; 15% for yearly membership)`,
            `Entitled to a free training session with one of ATP’s coaches once a quarter.`,
            `Get to have one free run/hike Saturday with Abuja Run Club.`,
            `Get to enjoy Exclusive members’ social events.`,
            `Every new member receives an ATP welcome package`,
        ]
    },
    dues: {
        monthly: {
            price: 4000,
            dollarPrice: 4,
            discount: 5,
            duration: 1
        },
        quarterly: {
            price: 14000,
            dollarPrice: 11,
            discount: 5,
            duration: 4
        },
        biAnnually: {
            price: 27000,
            dollarPrice: 21,
            discount: 7,
            duration: 6
        },
        yearly: {
            price: 50000,
            dollarPrice: 40,
            discount: 15,
            duration: 12
        }
    },
    packages: {
        regular: {
            name: "Regular Package",
            info: `This is a plan for clients who intend to train at the national stadium with our amazing coaches. `,
            priceInfo: `Price: N150,000 ($100) for one (1) month; N426,000 ($283) for three (3) months (You save N24,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limitededition ATP cap.`,
            plans: [
                {
                    price: 150000,
                    dollarPrice: 100,
                    
                },
                {
                    price: 426000,
                    dollarPrice: 283,
                    
                }
            ]
        },
        standard: {
            name: "Standard Package",
            info: `This is a plan for clients who intend to have some sort of privacy to their training at Rockview Hotels Royale, Wuse II.`,
            priceInfo: `Price: N190,000 ($126) for one (1) month; N540,000 ($358) for three (3) months(You save N30,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limitededition ATP cap.`,
            plans: [
                {
                    price: 190000,
                    dollarPrice: 126,
                },
                {
                    price: 540000,
                    dollarPrice: 358,
                }
            ]
        },
        premium: {
            name: "Premium Package",
            info: `This plan is for exquisite clients who intend to have privacy in their training and meet a different class of people at Transcorp Hilton, Abuja.`,
            priceInfo: `Price: N250,000 ($166) for one (1) month; N720,000 ($480) for three (3) months(You save N30,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limitededition ATP cap.`,
            plans: [
                {
                    price: 250000,
                    dollarPrice: 166,
                },
                {
                    price: 720000,
                    dollarPrice: 480,
                }
            ]
        },
        family: {
            name: "Family Package",
            info: `: This plan is for a family of four (4) – Two (2) parents and two (2) kids under the age of 19.`,
            priceInfo: `Price: N760,000 ($504) for one (1) month; N1,620,000 ($1,075) for three (3) months Each member of the family will get a free tennis balls and limited-edition ATP cap.`,
            plans: [
                {
                    price: 760000,
                    dollarPrice: 504,
                },
                {
                    price: 1620000,
                    dollarPrice: 1075,
                }
            ]
        },
        couples: {
            name: "Couples Package",
            info: `This plan is for couples – a man and a woman`,
            priceInfo: `Price: N300,000 ($200) for one (1) month; N1,188,000 ($788) for three (3) months (You save N288,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limited-edition ATP cap.`,
            plans: [
                {
                    price: 300000,
                    dollarPrice: 200,
                },
                {
                    price: 1188000,
                    dollarPrice: 788,
                }
            ]
        }
    }
}