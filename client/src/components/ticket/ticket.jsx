export default function Ticket() {
    return (
        <>
            <div className="bgOverlay">
                <div className="ticketWrap">
                    <h2>Congratulations Prosper</h2>

                    <div className="ticketBox">
                        <div className="boxie">
                            qrCode
                        </div>
                    </div>

                    <p>You have successfully registered for the &quot;tour&quot;. Here are some important details you need to know</p>

                    <div className="tickDataWrap">
                        <p className="TickData">
                            <span className="blue bold">Name</span>
                            Prosper Ojukwu
                        </p>
                    </div>
                    <div className="tickDataWrap">
                        <p className="TickData">
                            <span className="blue bold">Ticket ID</span>
                            ATP-IDM922-24
                        </p>
                    </div>
                    <div className="tickDataWrap">
                        <p className="TickData">
                            <span className="blue bold">Date</span>
                            January 14th, 2025
                        </p>
                    </div>
                    <div className="tickDataWrap">
                        <p className="TickData">
                            <span className="blue bold">Venue</span>
                            National Stadium Abuja
                        </p>
                    </div>

                    <p>Take a screenshoot to save your ticket ID because you will not be admited without it</p>

                </div>
            </div>
        </>
    )
}