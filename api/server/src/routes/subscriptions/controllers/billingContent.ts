const BillingConfig = {
    dues: {
        monthly: {
            price: 6000,
            dollarPrice: 4,
            discount: 5,
            duration: 1
        },
        quarterly: {
            price: 15000,
            dollarPrice: 10,
            discount: 5,
            duration: 4
        },
        yearly: {
            price: 70000,
            dollarPrice: 50,
            discount: 15,
            duration: 12
        }
    },
    packages: {
        regular: {
            name: "Regular Package",
            discount: 5,
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
            discount: 7,
            info: `This is a plan for clients who intend to have some sort of privacy to their training at Rockview Hotels Royale, Wuse II.`,
            priceInfo: `Price: N190,000 ($126) for one (1) month; N540,000 ($358) for three (3) months(You save N30,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limitededition ATP cap.`,
            plans: [
                {
                    price: 216000,
                    dollarPrice: 126,
                },
                {
                    price: 640000,
                    dollarPrice: 358,
                }
            ]
        },
        premium: {
            name: "Premium Package",
            discount: 10,
            info: `This plan is for exquisite clients who intend to have privacy in their training and meet a different class of people at Transcorp Hilton, Abuja.`,
            priceInfo: `Price: N250,000 ($166) for one (1) month; N720,000 ($480) for three (3) months(You save N30,000 if you pay for 3 months). Registered clients in this plan will get a free tennis ball and a limitededition ATP cap.`,
            plans: [
                {
                    price: 270000,
                    dollarPrice: 166,
                },
                {
                    price: 792000,
                    dollarPrice: 480,
                }
            ]
        },
        family: {
            name: "Family Package",
            discount: 15,
            info: `This plan is for a family of four (4) – Two (2) parents and two (2) kids under the age of 19.`,
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
            discount: 10,
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

export default BillingConfig;