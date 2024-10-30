/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react"
import './style.css'

export default function Button({alt, full, blue, green, disabled, children, onClick}){
    const buttonRef = useRef()
    useEffect(()=>{
        if(alt && buttonRef.current){
            buttonRef.current.classList.add("alt")
        }
        if(blue && buttonRef.current){
            buttonRef.current.classList.add("blue")
        }
        if(full && buttonRef.current){
            buttonRef.current.classList.add("full")
        }
        if(green && buttonRef.current){
            buttonRef.current.classList.add("green")
        }
        if(disabled && buttonRef.current){
            buttonRef.current.classList.add("disabled")
        }
        if(!disabled && buttonRef.current){
            buttonRef.current.classList.remove("disabled")
        }
    }, [alt, blue, full, green, disabled])
    return(
        <button disabled={disabled} ref={buttonRef} onClick={onClick}>{children}</button>
    )
}