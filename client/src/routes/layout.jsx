/* eslint-disable react/prop-types */
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
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
import ForgotPassword from "./forgotPassword";
import ResetPassword from "./resetPassword";
import NewsArticle from "./newsArticle";
import Community from "./community";
import PlayerCommunity from "./user/community";
import LeaderboardPage from "./leaderboard";
import PlayerLeaderboard from "./user/leaderboardPage";
import GalleryPage from "./gallery";
import FriendlyMatches from "./user/matchesPage";
import LiveScoreTicker from "../components/system/live-score-ticker";
import "../libs/styles/routes-v2.css";
import "../libs/styles/pages-v3.css";
import { openShopWithSession, shopHref } from "../libs/shop";

// Hands the signed-in session to the shop when there is one, so a redirected player
// is not asked to sign in again on the storefront.
function ShopRedirect({ path = "/catalog" }) { useEffect(() => { if (!openShopWithSession(path)) window.location.replace(shopHref(path)); }, [path]); return null; }
function ProductRedirect() { const { slug } = useParams(); return <ShopRedirect path={`/product/${slug}`} />; }

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Navbar />
                <LiveScoreTicker mode="public" />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tournaments" element={<Tournament />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/news" element={<Resources />} />
                    <Route path="/news/:slug" element={<NewsArticle />} />
                    <Route path="/shop" element={<ShopRedirect />} />
                    <Route path="/shop/:slug" element={<ProductRedirect />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/cart" element={<ShopRedirect path="/cart" />} />
                    <Route path="/store/payment/callback" element={<ShopRedirect path={`/payment/callback${window.location.search}`} />} />
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
                        <Route path="/u/matches" element={<FriendlyMatches />} />
                        {/* Order history now lives on the ATP ROYALE storefront. */}
                        <Route path="/u/orders" element={<ShopRedirect path="/orders" />} />
                        <Route path="/u/community" element={<PlayerCommunity />} />
                        <Route path="/u/leaderboard" element={<PlayerLeaderboard />} />
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
