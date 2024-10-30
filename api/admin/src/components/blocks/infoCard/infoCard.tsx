import { ReactNode } from "react";
import "./style.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfoCard({title, info, extraInfo, children}:{
    title: string;
    info?: string | number;
    extraInfo: string;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title || "Card Header"}</CardTitle>
                {children}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{info || "--"}</div>
                <p className="text-xs text-muted-foreground">{extraInfo || "Card Extra Info"}</p>
            </CardContent>
        </Card>
    )
}