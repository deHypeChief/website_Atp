import { useEffect, useState } from "react";
import { client, urlFor } from "../../sanityClient";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function Reviews() {
	const [currentView, setCurrentView] = useState(0);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true); // Loading state
	const [error, setError] = useState(null); // Error state

	// Fetch reviews once on component mount
	useEffect(() => {
		async function getReviews() {
			setLoading(true); // Set loading state to true
			try {
				const data = await client.fetch(`
					*[_type == "reviews"]
				`);
				setReviews(data);
			} catch () {
				setError("Failed to load reviews");
			} finally {
				setLoading(false); // Set loading state to false after fetching is done
			}
		}
		getReviews();
	}, []); // Empty dependency array ensures it runs only once

	// Go to the next review
	function countUp() {
		if (currentView < reviews.length - 1) {
			setCurrentView((prev) => prev + 1);
		}
	}

	// Go to the previous review
	function countDown() {
		if (currentView > 0) {
			setCurrentView((prev) => prev - 1);
		}
	}

	// Handle the case when reviews are loading or failed to load
	if (loading) {
		return <p>Loading reviews...</p>;
	}

	if (error) {
		return <p>{error}</p>;
	}

	// Handle the case when there are no reviews
	if (reviews.length === 0) {
		return <p>No reviews available.</p>;
	}

	return (
		<section className="pair">
			<div className="aboutWrap">
				<div className="aboutImgRe">
					<img
						src={
							reviews[currentView]?.image?.asset?._ref
								? urlFor(reviews[currentView].image.asset._ref).url()
								: "" // Default image path if no image
						}
						style={{
							height: '100%',
							width: '100%',
							objectFit: 'cover',
						}}
						alt="Review Image"
					/>
				</div>
				<div className="testimoney">
					<div className="testInfo">
						<p>
							<i>
								&quot;
								{reviews[currentView]?.reviewContent}
								&quot;
							</i>
						</p>

						<div className="person">
							<h4>{reviews[currentView]?.name}</h4>
							<p>{reviews[currentView]?.role}</p>
						</div>
					</div>

					<div className="aboutAction">
						<div className="tesAction" onClick={countDown}>
							<Icon icon="ic:round-arrow-left" width="20px" height="20px" />
						</div>
						<div className="tesDots">
							{reviews.map((_, index) => (
								<div
									key={index}
									className={`aDot ${currentView === index ? "active" : ""}`}
								></div>
							))}
						</div>
						<div className="tesAction" onClick={countUp}>
							<Icon icon="ic:round-arrow-right" width="20px" height="20px" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
