import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./index";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";
import Tournament from "./tornament";
import Coaching from "./coaching";
import Dashboard from "./user/dashboard"
import YourTicket from "./user/ticket"
import Videos from "./videos";
import CoachInfo from "./coachId";
import About from "./about";
import Resources from "./resources";
import ContactUs from "./contact";
import DashboardLayout from "./user/layout";
import { Login, SignUp } from "./signUser";
import { AdultMembership, ChildrenMembership, ComboMembership } from "./membership";
import Billing from "./user/billingValid";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/tournaments" element={<Tournament />} />
                    <Route path="/resources" element={<Resources/>}/>
                    <Route path="/membership/">
                        <Route path="/membership/children" element={<ChildrenMembership/>}/>
                        <Route path="/membership/adult" element={<AdultMembership/>}/>
                        <Route path="/membership/combo" element={<ComboMembership/>}/>
                    </Route>
                    <Route path="/coaching">
                        <Route index element={<Coaching/>}/>
                        <Route path="/coaching/:id" element={<CoachInfo/>}/>
                    </Route>
                    <Route path="/videos" element={<Videos/>}/>
                    <Route path="/contact" element={<ContactUs/>}/>
                    <Route path="/u" element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="/u/ticket/:tournamentID" element={<YourTicket/>}/>
                        <Route path="/u/billing/:planID/:billingType/:coachId/planCallback" element={<Billing/>}/>
                    </Route>
                </Routes>
                <Footer/>
            </BrowserRouter>
        </>
    )
}