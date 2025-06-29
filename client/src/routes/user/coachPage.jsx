/* eslint-disable react/prop-types */
import { useState } from "react";
import { getUserCoachData, postComment } from "../../libs/api/api.endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/button/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const ReviewForm = ({ onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        rating: "",
        comment: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="coachText">
                    <div className="modal-header">
                        <div>
                            <h3>Post a Review</h3>
                            <p>Share your experience with your assigned coach</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="review-form">
                        <div className="form-group">
                            <label htmlFor="rating">Rating</label>
                            <input
                                required
                                id="rating"
                                name="rating"
                                onChange={handleChange}
                                value={formData.rating}
                                type="number"
                                className="textInput"
                                placeholder="Rate the coach (1-5)"
                                min="1"
                                max="5"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="comment">Your Review</label>
                            <textarea
                                required
                                id="comment"
                                name="comment"
                                onChange={handleChange}
                                value={formData.comment}
                                className="textAreaReview"
                                placeholder="Tell others about your experience with this coach..."
                                disabled={isLoading}
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="reviewBttn">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        Submit Review
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
const ReviewCard = ({ name, rating, comment }) => (
    <div className="coCBox" style={{
        margin: '0.5rem 0',
        padding: '1rem',
        display: 'block',
        width: '100%',
        boxSizing: 'border-box'
    }}>
        <div className="topCoHeader" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            flexWrap: 'nowrap'
        }}>
            <div className="imgSecH" style={{ flexShrink: 0 }}>
                <div className="user-initial" style={{
                    backgroundColor: '#113858',
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    fontSize: '16px'
                }}>
                    {name ? name.charAt(0).toUpperCase() : "A"}
                </div>
            </div>
            <div className="userContInfo" style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden'
            }}>
                <h3 style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    wordBreak: 'break-word',
                    lineHeight: '1.2'
                }}>{name}</h3>
                <div className="rating-stars" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ 
                        display: 'flex',
                        gap: '1px'
                    }}>
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rating ? "star-filled" : "star-empty"} style={{
                                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                                lineHeight: 1
                            }}>
                                ⭐
                            </span>
                        ))}
                    </div>
                    <span className="rating-number" style={{
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        color: '#666',
                        whiteSpace: 'nowrap'
                    }}>({rating}/5)</span>
                </div>
            </div>
        </div>
        <p className="textList" style={{
            margin: '0',
            lineHeight: '1.5',
            fontSize: 'clamp(0.85rem, 1.8vw, 0.9rem)',
            wordBreak: 'break-word',
            hyphens: 'auto',
            overflowWrap: 'break-word'
        }}>{comment}</p>
    </div>
);
const YourCoach = ({ actions }) => {
    // const [isCoachAssigned, setIsCoachAssigned] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const coach = useQuery({
        queryFn: () => getUserCoachData(),
        queryKey: ["coachUserData"]
    })

    const reviewMutation = useMutation({
        mutationFn: (reviewData) => postComment({
            coachId: coach?.data?.coachInfo?.coachId?._id,
            rating: parseInt(reviewData.rating),
            comment: reviewData.comment
        }),
        onSuccess: () => {
            // Refresh coach data to get updated reviews
            queryClient.invalidateQueries(['coachUserData']);
            setIsReviewModalOpen(false);
        },
        onError: (error) => {
            console.error("Error posting review:", error);
            alert("Failed to post review. Please try again.");
        }
    });

    const handleSubmitReview = (newReview) => {
        reviewMutation.mutate(newReview);
    };

    console.log(coach?.data)
    
    
    // No coach assigned view
    if (coach?.data?.coachInfo.status === "Pending") {
        return (
            <div className="noContent eWrap">
                <div className="ebound">
                    <div className="cleft">
                        <div className="boude">
                            <Icon icon="solar:clock-circle-bold-duotone" width="64" height="64" />
                        </div>
                        <h1>Getting Your Coach Ready</h1>
                        <p>We&apos;re matching you with the perfect coach for your needs. You&apos;ll receive an email notification soon with details about your assigned coach.</p>
                        <div className="status-indicator">
                            <Icon icon="solar:check-circle-bold" width="16" height="16" />
                            <span>Status: Coach Assignment Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (coach?.data?.coachInfo.status  !== "Pending" && coach?.data?.coachInfo.status !== "Assigned") {
        return (
            <div className="noContent eWrap">
                <div className="ebound">
                    <div className="cleft">
                        <div className="boude">
                            <Icon icon="solar:user-plus-bold-duotone" width="64" height="64" />
                        </div>
                        <h1>No Coach Assigned Yet</h1>
                        <p>Get access to professional tennis coaching by joining one of our training plans. Our expert coaches will help you improve your game and reach your goals.</p>
                        <div className="action-buttons">
                            <Link to={"/u/billings"}>
                                <Button onClick={actions}>
                                    Explore Training Plans
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {isReviewModalOpen && (
                <ReviewForm
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                    isLoading={reviewMutation.isPending}
                />
            )}

            <div className="eWrap">
                <div className="ebound eSplit cce">
                    <div className="cleft">
                        <div className="clefCont">
                            <div className="imgWrap">
                                <div className="imgCircel" style={{overflow: "hidden"}}>
                                    {coach?.data?.coachInfo?.coachId?.imageUrl ? (
                                        <img 
                                            src={coach.data.coachInfo.coachId.imageUrl} 
                                            alt={coach.data.coachInfo.coachId.coachName}
                                            className="coach-profile-img"
                                        />
                                    ) : (
                                        <Icon icon="solar:user-bold-duotone" width="48" height="48" />
                                    )}
                                </div>
                            </div>
                            <div className="coach-info" style={{ textAlign: "center" }}>
                                <p className="coach-label">Your Coach</p>
                                <h1 className="coach-name">{coach?.data.coachInfo.coachId.coachName}</h1>
                                {coach?.data?.coachInfo?.coachId?.avgRate ? (
                                    <div className="coach-rating">
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < Math.round(coach.data.coachInfo.coachId.avgRate) ? "star-filled" : "star-empty"}>
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                        <span className="rating-text">
                                            {coach.data.coachInfo.coachId.avgRate.toFixed(1)} average rating
                                        </span>
                                    </div>
                                ) : (
                                    <p className="no-rating">No ratings yet</p>
                                )}
                                <br />
                                <div className="coach-actions">
                                    <Button onClick={() => setIsReviewModalOpen(true)} className="review-btn">
                                        Add a Review
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="coContent">
                <div className="header">
                    <h2>
                        Reviews & Feedback
                    </h2>
                    {coach?.data?.coachInfo?.coachId?.comment?.length > 0 && (
                        <p className="review-count">
                            {coach.data.coachInfo.coachId.comment.length} review{coach.data.coachInfo.coachId.comment.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <div className="coContentBoxs" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '0',
                    margin: '0',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}>
                    {coach?.data?.coachInfo?.coachId?.comment?.length > 0 ? (
                        coach.data.coachInfo.coachId.comment.slice().reverse().map((review, index) => (
                            <ReviewCard
                                key={index}
                                name={review.userID?.fullName || "Anonymous User"}
                                rating={review.rating}
                                comment={review.comment}
                            />
                        ))
                    ) : (
                        <div className="no-reviews" style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: '#666'
                        }}>
                            <Icon icon="solar:chat-round-bold-duotone" width="48" height="48" />
                            <h3 style={{ 
                                margin: '1rem 0 0.5rem 0',
                                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)'
                            }}>No reviews yet</h3>
                            <p style={{
                                margin: '0',
                                fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                lineHeight: '1.4'
                            }}>Be the first to review this coach and help others!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default YourCoach;