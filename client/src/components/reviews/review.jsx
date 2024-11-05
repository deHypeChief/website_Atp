import { useEffect, useState } from "react";
import { client, urlFor } from "../../sanityClient";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function Reviews() {
	const [currentView, setCurrentView] = useState(0);
	const [review, setReviews] = useState([]);

	const reviews = [
		{
			text: "a",
		},
		{
			text: "b",
		},
		{
			text: "c",
		},
		{
			text: "d",
		},
		{
			text: "e",
		},
	]

	useEffect(() => {
		async function getReviews() {
			client
				.fetch(
					`
                		*[_type == "reviews"]
            		`
				)
				.then((data) => {
					console.log(data);
					setReviews(data);
				})
				.catch(console.error);
		}
		getReviews();
	}, []);

	function countUp() {
		if (currentView < (reviews.length -= 1)) {
			setCurrentView((prev) => (prev += 1));
		}
	}
	function countDown() {
		if (currentView > 0) {
			setCurrentView((prev) => (prev -= 1));
		}
	}

	return (
		<section className="pair">
			<div className="aboutWrap">
				<div className="aboutImgRe">
					<img
						src={
							review[currentView]?.image?.asset?._ref
								? urlFor(review[currentView].image.asset._ref).url()
								: "" // Set a default image path
						}
						alt="Review Image"
					/>
				</div>
				<div className="testimoney">
					<div className="testInfo">
						<p>
							<i>
								&quot;
								{review[currentView]?.homePageAboutText}
								&quot;
							</i>
						</p>

						<div className="person">
							<h4>{review[currentView]?.name}</h4>
							<p>{review[currentView]?.role}</p>
						</div>
					</div>

					<div className="aboutAction">
						<div className="tesAction" onClick={countDown}>
							<Icon icon="ic:round-arrow-left" width="20px" height="20px" />
						</div>
						<div className="tesDots">
							<div className={`aDot ${currentView == 0 ? "active" : ""}`}></div>
							<div className={`aDot ${currentView == 1 ? "active" : ""}`}></div>
							<div className={`aDot ${currentView == 2 ? "active" : ""}`}></div>
							<div className={`aDot ${currentView >= 3 ? "active" : ""}`}></div>
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
