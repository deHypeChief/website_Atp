import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/button/button";
import "../libs/styles/auth.css"
import {
    useMutation,
} from '@tanstack/react-query'
import { useEffect, useState } from "react";
import { useAuth } from "../libs/hooks/use-auth";
import { getMembershPayLink } from "../libs/api/api.endpoints";



export function Login() {
    const navigate = useNavigate()
    const { isAuthenticated, userLogin } = useAuth()
    const [payQuery, setPayQuery] = useState("")

    const [payload, setPayload] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")

    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "block"
        document.getElementsByTagName("footer")[0].style.display = "block"
    }, [])

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const payParam = queryParams.get('pay');

        if (payParam) {
            setPayQuery(payParam);
        }
    }, []);

    useEffect(() => {
        async function checkAuth() {
            const auth = await isAuthenticated()

            console.log(auth)

            if (auth) {
                navigate(`/u`)
            }
        }
        checkAuth()
    }, [])

    const { mutateAsync: createUserMu, isPending } = useMutation({
        mutationFn: userLogin,
        onSuccess: (data) => {
            console.log(data);
            navigate(`/u?pay=${payQuery}`)
        },
        onError: (err) => {
            setError(err.response.data.message)
        }
    })

    function handleChange(e) {
        const { name, value } = e.target;
        setPayload({
            ...payload,
            [name]: name === "email" ? value.toLowerCase() : value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const areAllFieldsFilled = Object.values(payload).every(field => field !== '');
        if (!areAllFieldsFilled) {
            setError('Please fill out all fields before submitting.');
            return;
        }
        setError("")
        await createUserMu(payload)
        console.log(payQuery)
    }


    return (
        <section className="auth">
            <div className="authLeft">
                <div className="logoTop"></div>
                <div className="authForm">
                    <div className="authHeader">
                        <h1>Login</h1>
                        <p>Welcome back, please enter your details</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="authformWrap log">
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Email</p>
                                </div>
                                <input
                                    name="email"
                                    value={payload.email}
                                    onChange={handleChange} type="text" placeholder="Your email address" />
                            </div>
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Password</p>
                                </div>
                                <input
                                    name="password"
                                    value={payload.password}
                                    onChange={handleChange} type="password" placeholder="Enter your password" />
                            </div>
                        </div>
                        <div className="formAction">
                            <Button disabled={isPending}>
                                {
                                    isPending ? "Validating account.." : "Login"
                                }</Button>
                        </div>
                    </form>
                    <p className="errror">
                        {
                            error !== "" ? error : ""
                        }
                    </p>
                    {/* <SocialAuth /> */}
                    <div className="extraAction">
                        <p>
                            Don&apos;t have an account?
                            <Link to={"/signup"} >
                                <span className="green">Sign up</span>
                            </Link>
                        </p>
                        <p>
                            Forgot your password?
                            <Link to="/forgot-password">
                                <span className="green">Reset it</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div className="authRight"></div>
        </section>
    )
}


export function SignUp() {
    const navigate = useNavigate()
    const { isAuthenticated, userRegister } = useAuth()
    // const [isPaying, setIsPaying] = useState(false)
    const [payQuery, setPayQuery] = useState("")

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const payParam = queryParams.get("pay");
        console.log(payParam);

        if (payParam) {
            // Safely store it as encoded for redirect later
            setPayQuery(`?pay=${encodeURIComponent(payParam)}`);
        }
    }, [location.search]);

    const [payload, setPayload] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        dob: "",
        phoneNumber: "",
        role: "",
        level: "",
    })
    const [error, setError] = useState("")

    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "block"
        document.getElementsByTagName("footer")[0].style.display = "block"
    }, [])
    useEffect(() => {
        async function checkAuth() {
            const auth = await isAuthenticated()

            // console.log(auth)

            if (auth) {
                navigate("/u")
            }
        }
        checkAuth()
    }, [])

    const { mutateAsync: createUserMu, isPending } = useMutation({
        mutationFn: userRegister,
        onSuccess: () => {
            navigate(`/login${payQuery}`)
        },
        onError: (err) => {
            setError(err.response.data.message)
        }
    })

    function handleChange(e) {
        const { name, value } = e.target;
        setPayload({
            ...payload,
            [name]: name === "email" ? value.toLowerCase() : value
        });
    }
    async function handleSubmit(e) {
        e.preventDefault()
        const areAllFieldsFilled = Object.values(payload).every(field => field !== '');
        if (!areAllFieldsFilled) {
            setError('Please fill out all fields before submitting.');
            return;
        }
        setError("")
        await createUserMu(payload)
        // console.log(payload)
        console.log(payQuery);
    }

    return (
        <section className="auth">
            <div className="authLeft">
                <div className="logoTop"></div>
                <div className="authForm">
                    <div className="authHeader">
                        <h1>Sign Up</h1>
                        <p>Enter your details below to create an account and get started</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="authformWrap">
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Name</p>
                                </div>
                                <input
                                    name="fullName"
                                    value={payload.fullName}
                                    onChange={handleChange}
                                    type="text"
                                    required
                                    placeholder="Your full name" />
                            </div>
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Username</p>
                                </div>
                                <input
                                    name="username"
                                    value={payload.username}
                                    onChange={handleChange}
                                    type="text"
                                    pattern='^[a-zA-Z0-9_]+$'
                                    title='Only letters, numbers, underscores allowed'
                                    required
                                    placeholder="Enter your username" />
                            </div>
                        </div>
                        <div className="authformWrap">
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Email</p>
                                </div>
                                <input type="text"
                                    name="email"
                                    value={payload.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email address" />
                            </div>
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Phone Number</p>
                                </div>
                                <input
                                    name="phoneNumber"
                                    value={payload.phoneNumber}
                                    onChange={handleChange}
                                    type="tel"
                                    required
                                    placeholder="Enter your phone number" />
                            </div>
                        </div>
                        <div className="authformWrap">
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Password</p>
                                </div>
                                <input
                                    name="password"
                                    value={payload.password}
                                    onChange={handleChange}
                                    required
                                    type="password" placeholder="Enter your password" />
                            </div>
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Date of Birth</p>
                                </div>
                                <input
                                    name="dob"
                                    value={payload.dob}
                                    onChange={handleChange}
                                    required
                                    type="date" placeholder="Enter your date of birth" />
                            </div>
                        </div>
                        <div className="authformWrap">
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Role</p>
                                </div>
                                <select name="role"
                                    value={payload.role}
                                    onChange={handleChange}>

                                    <option value="">-Select current role-</option>
                                    <option value="kids amatuer">Student</option>
                                    <option value="kids amatuer">Coach</option>
                                </select>
                            </div>
                            <div className="authInputWrap">
                                <div className="text">
                                    <p>Level</p>
                                </div>
                                <select name="level"
                                    value={payload.level}
                                    onChange={handleChange}>

                                    <option value="">-Select current level-</option>
                                    <option value="kids amatuer">Kids Amatuer</option>
                                    <option value="kids mid-level">Kids Mid-level</option>
                                    <option value="kids professional">Kids Professional</option>
                                    <option value="adult amatuer">Adult Amatuer</option>
                                    <option value="adult mid-level">Adult Mid-level</option>
                                    <option value="adult professional">Adult Professional</option>
                                </select>
                            </div>
                        </div>
                        <div className="formAction">
                            <Button disabled={isPending}>
                                {
                                    isPending ? "Creating your account.." : "Create Account"
                                }
                            </Button>
                        </div>
                    </form>

                    <p className="errror">
                        {
                            error !== "" ? error : ""
                        }
                    </p>

                    {/* <SocialAuth /> */}
                    <div className="extraAction">
                        <p>
                            Already have an account?
                            <Link to={"/login"} >
                                <span className="green">Login</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div className="authRight"></div>
        </section>
    )
}