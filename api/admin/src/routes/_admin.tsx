import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import "../assets/style/routes/adminLayout.css"
import { Header4 } from '@/components/typography'
import { BadgeInfo, Database, LayoutDashboard, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'

export const Route = createFileRoute('/_admin')({
    beforeLoad: async ({ context }) => {
        const { isAuthenticated } = context.authentication;
        const auth = await isAuthenticated()
        if (!auth) {
            throw redirect({ to: '/' });
        }
    },
    component: () => <AdminLayout />,
})

function AdminLayout() {
    const { admin } = useAuth()
    const links = [
        {
            name: "Users",
            link: "/users",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                    <g fill="none" stroke="white" strokeWidth={1.7}>
                        <circle cx={12} cy={6} r={4}></circle>
                        <path d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z"></path>
                    </g>
                </svg>
            )
        },
        {
            name: "Matches",
            link: "/matches",
            icon: (<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                    <path d="M10.7 4.7c3-3 7.4-3.6 9.8-1.2s1.8 6.8-1.2 9.8a9.5 9.5 0 0 1-4.3 2.5c-2.1.5-4.1.1-5.5-1.3S7.7 11.1 8.2 9a9.5 9.5 0 0 1 2.5-4.3"></path>
                    <path d="M8.2 9L6 18l9-2.2M2 22l4-4"></path>
                    <circle cx={20} cy={20} r={2}></circle>
                </g>
            </svg>)
        },
        {
            name: "Tournaments",
            link: "/tournaments",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                    <g fill="none" stroke="white" strokeWidth={1.7}>
                        <path d="M12 16c-5.76 0-6.78-5.74-6.96-10.294c-.051-1.266-.076-1.9.4-2.485c.475-.586 1.044-.682 2.183-.874A26.4 26.4 0 0 1 12 2c1.784 0 3.253.157 4.377.347c1.139.192 1.708.288 2.184.874s.45 1.219.4 2.485C18.781 10.26 17.761 16 12.001 16Z"></path>
                        <path strokeLinecap="round" d="M12 16v3"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 22h-7l.34-1.696a1 1 0 0 1 .98-.804h4.36a1 1 0 0 1 .98.804z"></path>
                        <path d="m19 5l.949.316c.99.33 1.485.495 1.768.888S22 7.12 22 8.162v.073c0 .86 0 1.291-.207 1.643s-.584.561-1.336.98L17.5 12.5M5 5l-.949.316c-.99.33-1.485.495-1.768.888S2 7.12 2 8.162v.073c0 .86 0 1.291.207 1.643s.584.561 1.336.98L6.5 12.5m4.646-6.477C11.526 5.34 11.716 5 12 5s.474.34.854 1.023l.098.176c.108.194.162.29.246.354c.085.064.19.088.4.135l.19.044c.738.167 1.107.25 1.195.532s-.164.577-.667 1.165l-.13.152c-.143.167-.215.25-.247.354s-.021.215 0 .438l.02.203c.076.785.114 1.178-.115 1.352c-.23.174-.576.015-1.267-.303l-.178-.082c-.197-.09-.295-.135-.399-.135s-.202.045-.399.135l-.178.082c-.691.319-1.037.477-1.267.303s-.191-.567-.115-1.352l.02-.203c.021-.223.032-.334 0-.438s-.104-.187-.247-.354l-.13-.152c-.503-.588-.755-.882-.667-1.165c.088-.282.457-.365 1.195-.532l.19-.044c.21-.047.315-.07.4-.135c.084-.064.138-.16.246-.354z"></path>
                        <path strokeLinecap="round" d="M18 22H6"></path>
                    </g>
                </svg>
            )
        },
        {
            name: "Coaches",
            link: "/coaches",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                    <g fill="none" fillRule="evenodd">
                        <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
                        <path fill="currentColor" d="M2.638 4.929a2.5 2.5 0 0 1 4.12.922a7 7 0 0 1 7.34 1.354l.207.198l7.778 7.779a1 1 0 0 1 .083 1.32l-.083.094l-2.121 2.121a1 1 0 0 1-1.165.182l-.111-.067l-3.584-2.48A7 7 0 0 1 3.255 8.917a2.5 2.5 0 0 1-.617-3.988M5.82 8.818a5 5 0 1 0 8.059 5.67a1 1 0 0 1 1.473-.396l3.786 2.62l.824-.823l-7.071-7.071a5 5 0 0 0-7.071 0m5.656 1.414a3 3 0 1 1-4.242 4.243a3 3 0 0 1 4.243-4.243m-2.828 1.415a1 1 0 1 0 1.414 1.414a1 1 0 0 0-1.414-1.415M4.76 6.342a.5.5 0 1 0-.707.707a.5.5 0 0 0 .707-.707"></path>
                    </g>
                </svg>
            )
        },
        {
            name: "Leaderboard",
            link: "/leaderboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 7a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 3.5l-1.322 2.68l-2.958.43l2.14 2.085l-.505 2.946L12 17.25l2.645 1.39l-.505-2.945l2.14-2.086l-2.958-.43zm1-8.501L18 2v3l-1.363 1.138A9.9 9.9 0 0 0 13 5.05zm-2 0v3.05a9.9 9.9 0 0 0-3.636 1.088L6 5V2z"></path>
                </svg>
            )
        }
    ]
    const [open, setOpen] = useState(false)

    function handleHam() {
        setOpen(!open)
    }
    return (
        <section className="layoutSet">
            <div className="navTop">
                <div className="logoV">
                    <div className="logoInfoV">
                        <div className="logo">
                            <BadgeInfo size={28} />
                        </div>
                        <div className="logoText">
                            <Header4>ATP Admin.</Header4>
                        </div>
                    </div>
                </div>
                <div className="navHam" onClick={handleHam}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"></path>
                    </svg>
                </div>
            </div>
            <div className={`layoutLeft ${open ? "mobile-Open" : "null"}`}>
                <div className="listWrap">

                    <div className="listMain">
                        <div className="logoInfo">
                            <div className="logo">
                                <BadgeInfo size={28} />
                            </div>
                            <div className="logoText">
                                <Header4>ATP Admin.</Header4>
                            </div>
                        </div>
                        <div className="list">
                            {
                                links.map(link =>
                                    <Link key={link.name} onClick={handleHam} to={link.link} className={(({ isActive }) => isActive && "active").toString()}>
                                        {link.icon}
                                        <p>{link.name}</p>
                                    </Link>
                                )
                            }
                        </div>
                    </div>

                    <div className="listMain">
                        {/* base action */}
                        <div className="list">
                            <Link to={"/settings"} onClick={handleHam} className={(({ isActive }) => isActive && "active").toString()} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
                                        <circle cx={12} cy={12} r={3}></circle>
                                        <path d="M13.765 2.152C13.398 2 12.932 2 12 2s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083c-.092.223-.129.484-.143.863a1.62 1.62 0 0 1-.79 1.353a1.62 1.62 0 0 1-1.567.008c-.336-.178-.579-.276-.82-.308a2 2 0 0 0-1.478.396C4.04 5.79 3.806 6.193 3.34 7s-.7 1.21-.751 1.605a2 2 0 0 0 .396 1.479c.148.192.355.353.676.555c.473.297.777.803.777 1.361s-.304 1.064-.777 1.36c-.321.203-.529.364-.676.556a2 2 0 0 0-.396 1.479c.052.394.285.798.75 1.605c.467.807.7 1.21 1.015 1.453a2 2 0 0 0 1.479.396c.24-.032.483-.13.819-.308a1.62 1.62 0 0 1 1.567.008c.483.28.77.795.79 1.353c.014.38.05.64.143.863a2 2 0 0 0 1.083 1.083C10.602 22 11.068 22 12 22s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083c.092-.223.129-.483.143-.863c.02-.558.307-1.074.79-1.353a1.62 1.62 0 0 1 1.567-.008c.336.178.579.276.819.308a2 2 0 0 0 1.479-.396c.315-.242.548-.646 1.014-1.453s.7-1.21.751-1.605a2 2 0 0 0-.396-1.479c-.148-.192-.355-.353-.676-.555A1.62 1.62 0 0 1 19.562 12c0-.558.304-1.064.777-1.36c.321-.203.529-.364.676-.556a2 2 0 0 0 .396-1.479c-.052-.394-.285-.798-.75-1.605c-.467-.807-.7-1.21-1.015-1.453a2 2 0 0 0-1.479-.396c-.24.032-.483.13-.82.308a1.62 1.62 0 0 1-1.566-.008a1.62 1.62 0 0 1-.79-1.353c-.014-.38-.05-.64-.143-.863a2 2 0 0 0-1.083-1.083Z"></path>
                                    </g>
                                </svg>
                                <p>Settings</p>
                            </Link>
                        </div>

                        <div className="listProfile">
                            <div className="o">
                                {admin()?.name.split(" ")[0].split("")[0]}
                            </div>
                            <div className="oContent">
                                <p>{admin()?.name}</p>
                                <p>{admin()?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="layoutRight">
                <Outlet />
            </div>
        </section >
    )
}

