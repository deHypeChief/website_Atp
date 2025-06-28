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
import Tournaments from "./user/tournamentPage";
import Notifications from "./user/notificationPage";
import { Billings } from "./user/billingPage";
import YourCoach from "./user/coachPage";
import Tickets from "./user/ticketPage";
import { BillingHistory } from "./user/billingHistory";
import MatchesPage from "./user/matchesPage";
import ForgotPassword from "./forgotPassword";
import ResetPassword from "./resetPassword";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tournaments" element={<Tournament />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/membership/">
                        <Route path="/membership/children" element={<ChildrenMembership />} />
                        <Route path="/membership/adult" element={<AdultMembership />} />
                        <Route path="/membership/combo" element={<ComboMembership />} />
                    </Route>
                    <Route path="/coaching">
                        <Route index element={<Coaching />} />
                        <Route path="/coaching/:id" element={<CoachInfo />} />
                    </Route>
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/u" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="/u/notifications" element={<Notifications />} />
                        <Route path="/u/tournaments" element={<Tournaments />} />
                        <Route path="/u/billings" element={<Billings />} />
                        <Route path="/u/coach" element={<YourCoach />} />
                        <Route path="/u/tickets" element={<Tickets />} />
                        <Route path="/u/matches" element={<MatchesPage />} />
                        <Route path="/u/billings/history" element={<BillingHistory />} />
                        <Route path="/u/ticket/:tournamentID" element={<YourTicket />} />
                        <Route path="/u/bills/:type/:subType/:duration/:autoRenew" element={<Billing />} />
                    </Route>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </>
    )
}