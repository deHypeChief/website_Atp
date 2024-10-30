import { ReactNode } from "react";
import "./style.css"
import { Header2, Paragraph } from "@/components/typography";

export default function Header({ title, subText, children }: {
    title: string;
    subText: string;
    children?: ReactNode;
}) {
    return (
        <div className="header">
            <div className="headerInfo">
                <Header2>{title || "Header Tex"}</Header2>
                <Paragraph>{subText || "Short info text on this section"}</Paragraph>
            </div>
            <div className="actionSpace">
                {children}
            </div>
        </div>
    )
}