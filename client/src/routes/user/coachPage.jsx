/* eslint-disable react/prop-types */
import { useState } from "react";
import { getMe, getUserCoachData } from "../../libs/api/api.endpoints";
import { useQuery } from "@tanstack/react-query";
import ball from "/ball.png"
import Button from "../../components/button/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const ReviewForm = ({ onClose, onSubmit }) => {
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
        onClose();
    };

    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="coachText">
                    <h3>Post a Review</h3>
                    <p>Post your review on your assigned coach</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            required
                            name="rating"
                            onChange={handleChange}
                            value={formData.rating}
                            type="number"
                            className="textInput"
                            placeholder="Rate the coach (0-5)"
                            min="0"
                            max="5"
                        />
                        <textarea
                            required
                            name="comment"
                            onChange={handleChange}
                            value={formData.comment}
                            className="textAreaReview"
                            placeholder="Write your comment here"
                        ></textarea>
                        <div className="reviewBttn">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Back
                            </Button>
                            <Button type="submit">
                                Drop a review
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
const ReviewCard = ({ name, rating, comment }) => (
    <div className="coCBox">
        <div className="topCoHeader">
            <div className="imgSecH"></div>
            <div className="userContInfo">
                <h3>{name}</h3>
                <p>{rating} stars</p>
            </div>
        </div>
        <p className="textList">{comment}</p>
    </div>
);
const YourCoach = ({ actions }) => {
    // const [isCoachAssigned, setIsCoachAssigned] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviews, setReviews] = useState([
        { id: 1, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 2, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 3, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 4, name: "David Moves", rating: "2", comment: "hello big matr" }
    ]);
    const user = useQuery({
        queryKey: ["user"],
        queryFn: () => getMe(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })

    const coach = useQuery({
        queryFn: () => getUserCoachData(),
        queryKey: ["coachUserData"]
    })

    const handleSubmitReview = (newReview) => {
        const review = {
            id: reviews.length + 1,
            name: "Current User", // You might want to get this dynamically
            ...newReview
        };
        setReviews(prev => [...prev, review]);
        console.log("Posting Comment:", newReview);
    };

    console.log(coach?.data)
    
    
    // No coach assigned view
    if (coach?.data?.coachInfo.status === "Pending") {
        return (
            <div className="noContent eWrap">
                <div className="ebound">
                    <div className="cleft">
                        <div className="boude">
                            <img src={ball} alt="" />
                        </div>
                        <h1>Getting your Coach</h1>
                        <p>Expect an email notification soon with details about your coach.</p>
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
                        <h1>No Coach Yet</h1>
                        <p>Join a training plan and a coach would be assigned to you</p>

                        <Link to={"/u/billings"}>
                            <Button onClick={actions}>See Training Plans</Button>
                        </Link>
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
                />
            )}

            <div className="eWrap">
                <div className="ebound eSplit cce">
                    <div className="cleft">
                        <div className="clefCont">
                            <div className="imgWrap">
                                <div className="imgCircel">
                                    <Icon icon="solar:user-bold" width="44" height="44" />
                                    {/* <img src={} alt="" /> */}
                                </div>
                            </div>
                            <p>Your Coach,</p>
                            <h1>{coach?.data.coachInfo.coachId.coachName}</h1>
                            {/* <Button onClick={() => setIsReviewModalOpen(true)}>
                                Add a Review
                            </Button> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="coContent">
                <div className="header">
                    <h2>Reviews</h2>
                </div>
                <div className="coContentBoxs">
                    {reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            name={review.name}
                            rating={review.rating}
                            comment={review.comment}
                        />
                    ))}
                </div>
            </div> */}
        </>
    );
};

export default YourCoach;