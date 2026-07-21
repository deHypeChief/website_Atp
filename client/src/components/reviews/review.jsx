import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "../../libs/api/api.endpoints";
import { Icon } from "@iconify/react/dist/iconify.js";
import line from "../../libs/images/Line2.png"


export default function Reviews() {
	const [currentView, setCurrentView] = useState(0);
	const { data, isLoading:loading, isError:error } = useQuery({ queryKey:["site-content"], queryFn:getSiteContent });
	const reviews = data?.reviews || [];

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
			<div className="secTop" style={{ marginBottom: "2rem" }}>
				<div className="heroSubTop">
					<div className="rArrow rL">
						<img src={line} alt="" />
					</div>
					<h2>
						Student Reviews	
					</h2>
					<div className="rArrow rR">
						<img src={line} alt="" />
					</div>
				</div>
				<h1>
					What Our Students Say
				</h1>
			</div>

			<br />
			<div className="aboutWrap mon">
				<div className="aboutImgRe">
					<img
						src={
							reviews[currentView]?.imageUrl || ""
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
