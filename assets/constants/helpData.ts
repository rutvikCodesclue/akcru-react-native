export type helpData = {
    id: string;
    faqsTitle: string;
    faqs: {
        id: string;
        question: string;
        answer: string;
    }[];
}


export const helpData = [
    {
        id: 'PointsandRewardsAkcruDollars',
        faqsTitle: 'Points and Rewards: Akcru Dollars (AD)',
        faqs: [
            {
                id: '0',
                question: 'What are Akcru Dollars?',
                answer: 'Akcru Dollars, also known as AD, are valuable reward earned by users on the Akcru Multifarious streaming app.',
            },
            {
                id: '1',
                question: 'How do I earn AD?',
                answer: 'You can earn AD by simply spending time watching content on Akcru.',
            },
            {
                id: '2',
                question: 'How much AD can I earn while watching a movie?',
                answer: "While watching a movie, you can earn 1 AD for every 30 seconds of content consumed. Please note that you won't earn additional AD by fast forwarding or rewinding the content.",
            },
            {
                id: '3',
                question: 'Can I share my AD with other users?',
                answer: 'Yes, you can! Akcru allows you to share your earned AD with other users on the platform. To do this, go to the wallet tab on your profile page and select the user you want to transfer your AD too.',
            },
            {
                id: '4',
                question: 'How can I use my AD in the app?',
                answer: 'You have a few options for using your AD on the Akcru Multifarious streaming app. You can transfer it to USD, share it with other users, or use it to purchase additional Movie Invite Tickets (MITs).',
            },
        ],
    },
    {
        id: 'MovieViewing',
        faqsTitle: 'Movie Viewing',
        faqs: [
            {
                id: '0',
                question: 'How do I watch a movie?',
                answer: "As a subscriber to Akcru, you have three options for viewing content, but we highly recommend the shared experience with your 'Cru' of family and friends, which is unique to Akcru:\n1. You can watch content individually.\n2. You can watch content with your 'Cru' (up to 6 people at a time).\n3. You can watch content in a one-on-one setting, which we like to call the 'MIT date'.",
            },
            {
                id: '1',
                question: 'Can I share my account with someone else?',
                answer: "While you can share your username and password with others, it's strongly discouraged. Sharing your credentials means that the individual will have access to any Akcru Dollars (AD) you've earned over time from watching content. Please note that Akcru will not be responsible for any theft or unauthorized transfer or use of your AD in this case.",
            },
        ],
    },
    {
        id: 'UpdatingProfile',
        faqsTitle: 'Updating Profile',
        faqs: [
            {
                id: '0',
                question: 'How do I upload a photo to my profile?',
                answer: "Uploading a photo to your profile is easy. Go to your main profile details page and click the 'edit profile' link at the top of the page next to your profile avatar. Once you're in the edit profile page, click the 'edit profile photo' link highlighted in orange. Your camera roll will open up, allowing you to choose the photo you'd like to feature as your avatar.",
            },
            {
                id: '1',
                question: 'How do I change my username?',
                answer: 'Just like uploading a photo to your profile, you can change your username, bio, and email in the edit profile page.',
            },
            {
                id: '2',
                question: 'Can I add more photos of myself to my profile?',
                answer: 'As a subscriber, you can add up to 5 photos, each under 2MB in size, to your profile page.',
            },
            {
                id: '3',
                question: 'What is the Akcruit badge under my name?',
                answer: " As a subscriber, there are four user badges that you can earn by watching content over time. The 'Akcruit' badge is the default badge for all users. Here are all the badges and their associated benefits:\n1. Akcruit: Can have up to 6 people in their 'Cru'.\n2. Hero: Can have up to 7 people in their 'Cru'.\n3. Super Hero: Can have up to 8 people in their 'Cru'.\n4. Guardian: Can have up to 9 people in their 'Cru'.",
            },
            {
                id: '4',
                question: 'How do I follow someone?',
                answer: "As a subscriber, you can simply press the 'follow' button on the profiles of other users who haven't set their profiles to private.",
            },
            {
                id: '5',
                question: 'How do I logout of my account?',
                answer: 'To log out as a subscriber, go to your edit profile page and click the "sign out" link, which will be highlighted in orange',
            },
        ],
    },
    {
        id: 'CruingUp',
        faqsTitle: 'Cruing Up',
        faqs: [
            {
                id: '0',
                question: 'What is having a Cru?',
                answer: "As a subscriber, you have the ability to create a 'Cru' with your closest family and friends. A Cru is a group consisting of up to 6 or 9 individuals with whom you can share a unique viewing experience on the Akcru platform.",
            },
            {
                id: '1',
                question: 'How can I schedule a Cru view with my Cru?',
                answer: "As a subscriber, scheduling a 'Cru View' with your Cru is straightforward. On your main user profile page, look for the 'schedule a Cru view' tab, highlighted in orange. Click on this tab to initiate the scheduling process.",
            },
            {
                id: '2',
                question: 'How Many Cru Invites Can You Send?',
                answer: 'Subscribers have the privilege of sending an unlimited number of  “Cru View" invites that can be scheduled with your Cru. This means you can organize and invite your Cru members to shared viewing events without limitations.',
            },
            {
                id: '3',
                question: 'How can I edit my Cru',
                answer: 'Subscribers have the flexibility to edit their Cru as needed. To do this, navigate to your main profile details page. Here, you can: *Add new members to your Cru by using the search bar to find and send them a Cru invite. *Choose members from those waiting to be added to your Cru by pressing the "add member" button. *Remove members from your existing Cru by selecting the "delete member" option.',
            },
        ],
    },
    {
        id: 'MovieInviteTickets',
        faqsTitle: 'Movie Invite Tickets (MITs)',
        faqs: [
            {
                id: '0',
                question: 'How can I schedule a MIT with another user?',
                answer: 'A MIT stands for "Movie Invite Ticket," which grants subscribers the ability to send one-on-one movie date invites outside of their "Cru View" to other users on Akcru.',
            },
            {
                id: '1',
                question: 'How to Schedule a MIT with Another User?',
                answer: 'Sending a MIT is easy and can be done in two ways:\n1. The first method is to send a MIT invite, which is accessible from the movie details page.\n2. The second approach is to send a MIT from your user profile page, using the MIT icon.',
            },
            {
                id: '2',
                question: 'What happens if I run out of MITs?',
                answer: 'As a subscriber, you are entitled to one free MIT per week. If you exhaust your free MIT or wish to send more, you can purchase additional MITs from the Akcru marketplace.',
            },
            {
                id: '3',
                question: 'Who can I send MITs to?',
                answer: "Subscribers can send MITs to anyone, but it is the recipient's choice whether to accept or reject the MIT date invitation.",
            },
            {
                id: '4',
                question: 'What happens if someone rejects my MIT?',
                answer: 'If someone rejects your MIT, it will be returned to you without being used. However, if someone accepts your MIT but fails to show up at the scheduled date and time, you will lose the MIT, and Akcru will not be responsible for the lost MIT ticket.',
            },
        ],
    },
    {
        id: 'CruChew',
        faqsTitle: 'Cru Chew',
        faqs: [
            {
                id: '0',
                question: 'How do I Order Food using Cru Chew?',
                answer: "To order food on Cru Chew, follow these steps:\n1. Press the food icon located in the lower third of the app interface.\n2. Once you're on the Cru Chew page, simply enter your address or zip code.\n3. This action will display a list of local restaurants in your vicinity.",
            },
            {
                id: '1',
                question: 'How do I place an Order on Cru Chew?',
                answer: "Once you've selected a restaurant of your choice from the local options, you can proceed to place an order:\n1. Browse the restaurant's menu and select the dishes you'd like to order.\n2. When you're ready to complete your order, proceed to checkout.\n3. At checkout, you can choose to pay for your selected meals using the card on file or opt for another payment method of your choice.",
            },
        ],
    },
];

export type TrinityHowToData={
    id: string;
    title: string;
    link: string;
}

export const TrinityHowToData = [
    {
        id: '0',
        title: 'Upload Profile Image',
        link: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/AKCRU_TRINITY-UploadPhoto.mp4',
    },
    {
        id: '1',
        title: 'Schedule a CruView',
        link: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/AKCRU_TRINITY-ScheduleCruView.mp4',
    },
    {
        id: '2',
        title: 'Schedule a MIT',
        link: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/AKCRU_TRINITY-Schedule-A-Mit.mp4',
    },
    {
        id: '3',
        title: 'Change your username',
        link: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/AKCRU_TRINITY-ChangeUserName.mp4',
    },
];