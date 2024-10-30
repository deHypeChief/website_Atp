
import { useState } from "react";
import Button from "../components/button/button"
import "../libs/styles/contact.css"

const preMesssages = [
    `
    subject=I want to play tennis&body=Hello ATP, ...
    `,
    `
    subject=I want to teach tennis&body=Hello ATP, I am a proffesional tennis teacher and...
    `,
    `
    subject=Contact Support Team&body=I'd like to bring up an issue about ...
    `
]

export default function ContactUs() {
    const [mailConfig, setMailConfig] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        message: "",
    });
    const [bookDone, setBookDone] = useState(false)

    function sendMail() {
        emailjs.send(
            "service_3kwyl0r",
            "template_a1l8x31",
            mailConfig,
            "eAueIqiGEq3-_E8Y4" // Replace with your actual EmailJS public API key
        )
            .then(
                (response) => {
                    console.log("SUCCESS!", response.status, response.text);
                    setBookDone(true); // Show success message on successful send
                },
                (error) => {
                    console.log("FAILED...", error);
                }
            );
    }
    function handleChange(e) {
        const { name, value } = e.target;
        setMailConfig((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        sendMail(); // Trigger email sending on form submission
    }
    return (
        <>
            <section className="contact">
                <div className="contatSec">
                    <div className="chatHeader">
                        <h1>Chat to our team</h1>
                        <p>Need help with something? Get in touch with our friendly team and we’ll get back to you withing 24 hours</p>
                    </div>
                    <form>
                        <div className="formWrap">
                            <input
                                type="text"
                                placeholder="First name"
                                name="firstName"
                                value={mailConfig.firstName}
                                onChange={handleChange}
                                required
                            />
                            <inputinput
                                type="text"
                                placeholder="Last name"
                                name="lastName"
                                value={mailConfig.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="formWrap">
                            <input
                                type="text"
                                placeholder="Phone Number"
                                name="phoneNumber"
                                value={mailConfig.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Email"
                                name="email"
                                value={mailConfig.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <textarea
                            type="text"
                            placeholder="Message"
                            name="message"
                            value={mailConfig.message}
                            onChange={handleChange}
                            required
                        ></textarea>

                        <div className="formAction">
                            <a href={`mailto:admin@atpinternational.org?${preMesssages[0]}`}>

                            <div className="actionButton activeFo">
                                <div className="actIcon">

                                </div>
                                <div className="actionText">
                                    <p className="boldForm">I want to play Tennis</p>
                                    <p>I am a professional or amateur tennis player</p>
                                </div>
                            </div>
                            </a>
                            <a href={`mailto:admin@atpinternational.org?${preMesssages[1]}`}>

                            <div className="actionButton">
                                <div className="actIcon">

                                </div>
                                <div className="actionText">
                                    <p className="boldForm">I want to teach Tennis</p>
                                    <p>I am a professional tennis tutor</p>
                                </div>
                            </div>
                            </a>

                            <a href={`mailto:support@atpinternational.org?${preMesssages[2]}`}>
                                <div className="actionButton">
                                    <div className="actIcon">

                                    </div>
                                    <div className="actionText">
                                        <p className="boldForm">I want to contact support</p>
                                        <p>I'd like to bring up an issue</p>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <Button>Send Message</Button>
                    </form>

                </div>
                <div className="contactImg">

                </div>
            </section>
        </>
    )
}