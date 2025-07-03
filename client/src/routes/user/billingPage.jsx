/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { billingInfo, getPayMe, deleteUserAccount } from "../../libs/api/api.endpoints";
import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import { BillingContent, BillingContent2, BillingSummary } from "./billingSuport";
import { Link, useNavigate } from "react-router-dom";

export function Billings() {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultModal, setResultModal] = useState({ type: '', title: '', message: '', emailInfo: '' });
    const navigate = useNavigate();

    const { data, isLoading: billingLoading } = useQuery({
        queryKey: ["billingData"],
        queryFn: () => getPayMe(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const {
        data: payData,
        isLoading: payLoading,
    } = useQuery({
        queryKey: ["payInfo"],
        queryFn: () => billingInfo(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const payParam = queryParams.get('pay');

        if (payParam) {
            setIsSummaryOpen(true);
            setPaymentData(JSON.parse(payParam));
        }
    }, []);


    const openSummary = (data) => {
        setPaymentData(data);
        setIsSummaryOpen(true);
    };

    const handleDeleteAccount = () => {
        setShowDeleteWarning(true);
    };

    const confirmDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteUserAccount();
            console.log('Account deleted successfully:', result);

            // Clear user data from localStorage/sessionStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.clear();

            // Show formal success modal
            const emailMessage = result.emailSent
                ? `A confirmation email has been sent to ${result.userEmail}.`
                : 'Please note that no confirmation email could be sent.';

            setResultModal({
                type: 'success',
                title: 'Account Successfully Deleted',
                message: 'Your ATP account and all associated data have been permanently removed from our systems.',
                emailInfo: emailMessage
            });
            setShowResultModal(true);
            setShowDeleteWarning(false);

            // Auto redirect after 5 seconds
            setTimeout(() => {
                navigate('/');
                document.getElementsByTagName("nav")[0].style.display = "block"
                document.getElementsByTagName("footer")[0].style.display = "block"
            }, 5000);

        } catch (error) {
            console.error('Failed to delete account:', error);
            setResultModal({
                type: 'error',
                title: 'Account Deletion Failed',
                message: `We encountered an error while trying to delete your account: ${error.message}`,
                emailInfo: 'Your account and data remain intact. Please try again later or contact support.'
            });
            setShowResultModal(true);
            setShowDeleteWarning(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeleteAccount = () => {
        setShowDeleteWarning(false);
    };

    if (billingLoading || payLoading) {
        return (
            <div className="loadingContainer">
                <p>Loading billing information...</p>
            </div>
        );
    }

    // Helper function to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };


    return (
        <>
            {isSummaryOpen && (
                <BillingSummary action={setIsSummaryOpen} dataFn={paymentData} payDataRec={payData} subData={data} />
            )}

            {showDeleteWarning && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="warning-dialog" style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '500px',
                        margin: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '48px',
                                color: '#dc3545',
                                marginBottom: '10px'
                            }}>⚠️</div>
                            <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Delete Account</h2>
                            <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
                                Are you sure you want to delete your ATP account? This action cannot be undone and will permanently remove:
                            </p>
                            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginTop: '10px' }}>
                                A confirmation email will be sent to your registered email address.
                            </p>
                        </div>

                        <ul style={{
                            textAlign: 'left',
                            marginBottom: '25px',
                            paddingLeft: '20px',
                            color: '#666'
                        }}>
                            <li>Your profile and personal information</li>
                            <li>All membership and training subscriptions</li>
                            <li>Match history and tournament records</li>
                            <li>Payment history and billing information</li>
                            <li>Coach assignments and reviews</li>
                            <li>Notifications and preferences</li>
                        </ul>

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            marginTop: '20px'
                        }}>
                            <Button
                                onClick={cancelDeleteAccount}
                                style={{
                                    backgroundColor: '#6c757d',
                                    border: '1px solid #6c757d',
                                    padding: '10px 20px'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDeleteAccount}
                                disabled={isDeleting}
                                style={{
                                    backgroundColor: '#dc3545',
                                    border: '1px solid #dc3545',
                                    padding: '10px 20px'
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showResultModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1001
                }}>
                    <div className="result-dialog" style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        maxWidth: '550px',
                        margin: '20px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        border: `3px solid ${resultModal.type === 'success' ? '#28a745' : '#dc3545'}`
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{
                                fontSize: '64px',
                                color: resultModal.type === 'success' ? '#28a745' : '#dc3545',
                                marginBottom: '15px'
                            }}>
                                {resultModal.type === 'success' ? '✅' : '❌'}
                            </div>
                            <h2 style={{
                                color: resultModal.type === 'success' ? '#28a745' : '#dc3545',
                                marginBottom: '15px',
                                fontSize: '24px',
                                fontWeight: '600'
                            }}>
                                {resultModal.title}
                            </h2>
                            <p style={{
                                fontSize: '16px',
                                lineHeight: '1.6',
                                color: '#333',
                                marginBottom: '20px'
                            }}>
                                {resultModal.message}
                            </p>

                            {resultModal.emailInfo && (
                                <div style={{
                                    backgroundColor: resultModal.type === 'success' ? '#d4edda' : '#f8d7da',
                                    border: `1px solid ${resultModal.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                    color: resultModal.type === 'success' ? '#155724' : '#721c24',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    marginBottom: '25px'
                                }}>
                                    <strong>📧 Email Notification:</strong><br />
                                    {resultModal.emailInfo}
                                </div>
                            )}
                        </div>

                        {resultModal.type === 'success' ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginBottom: '20px',
                                    fontStyle: 'italic'
                                }}>
                                    You will be automatically redirected to the homepage in 5 seconds...
                                </p>
                                <Button
                                    onClick={() => {
                                        navigate('/')
                                        document.getElementsByTagName("nav")[0].style.display = "block"
                                        document.getElementsByTagName("footer")[0].style.display = "block"
                                    }}
                                    style={{
                                        backgroundColor: '#28a745',
                                        border: '1px solid #28a745',
                                        padding: '12px 30px',
                                        fontSize: '16px'
                                    }}
                                >
                                    Go to Homepage Now
                                </Button>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                                <Button
                                    onClick={() => setShowResultModal(false)}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        border: '1px solid #6c757d',
                                        padding: '12px 25px'
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowResultModal(false);
                                        setShowDeleteWarning(true);
                                    }}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        border: '1px solid #dc3545',
                                        padding: '12px 25px'
                                    }}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="coContent">
                <div className="header">
                    <h1>Billings</h1>
                    <p>Manage and renew your billings easily</p>
                </div>

                <div className="topWrapContent">
                    <div className="firste ebound eSplit">
                        <div className="topVV">
                            <div className="planWrap">
                                <p>Current Membership Package</p>
                                <h1>
                                    {data?.data.membership?.plan !== "none"
                                        ? data?.data.membership?.plan
                                        : "Free Plan"}
                                </h1>
                                {data?.data.membership?.plan !== "none" && (
                                    <p style={{ fontSize: ".8rem", paddingTop: "10px" }}>
                                        *Current Plan ends on {formatDate(data.data.membership?.endDate)}
                                    </p>
                                )}
                            </div>
                            <div className="actionB">
                                {/* {data?.data.membership?.plan !== "none" && (
                                    <Button>Renew Plan</Button>
                                )} */}
                            </div>
                        </div>
                    </div>

                    <BillingContent setAction={openSummary} />
                    <BillingContent2 data={payData} setAction={openSummary} userSubData={data} />

                    <div className="firste ebound eSplit">
                        <div
                            className="topVV"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div className="planWrap">
                                <h2>Your Billing History</h2>
                                <p style={{ fontSize: ".8rem" }}>
                                    List of all payments made on ATP
                                </p>
                            </div>
                            <div className="actionB">
                                <Link to="/u/billings/history">
                                    <Button>View History</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="firste ebound eSplit">
                        <div
                            className="topVV"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div className="planWrap">
                                <h2>Delete your ATP account</h2>
                                <p style={{ fontSize: ".8rem" }}>
                                    This will remove all your data, including your membership and billing information.
                                </p>
                            </div>
                            <div className="actionB">
                                <Button onClick={handleDeleteAccount} style={{ backgroundColor: '#dc3545', border: '1px solid #dc3545' }}>
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
