import { useQuery } from "@tanstack/react-query";
import { getNotify } from "../../libs/api/api.endpoints";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);


export default function Notifications() {
    const notifyMutation = useQuery({
        queryKey: ["notify"],
        queryFn: () => getNotify()
    })
    return (
        <>
            {
                notifyMutation.data?.length <= 0 ? (
                    <div className="noContent">
                        <div className="ebound ">
                            <div className="cleft">
                                <h1>No Notifications Yet</h1>
                                <p>We will keep you updated</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="coContent">
                        <div className="header">
                            <h1>Notifications</h1>
                        </div>

                        <div className="notiBoxi">
                            {
                                notifyMutation.data?.map((item, index) => (
                                    <div className="notiB" key={item.title}>
                                        <div key={"noytif" + index} className="titNotiB">
                                            <h2>{item.title}</h2>
                                            <p>{dayjs(item.createdAt).format("MMMM D, YYYY h:mm A")}</p>
                                        </div>
                                        <p>{item.message}</p>
                                    </div>
                                )
                                )
                            }
                        </div>
                    </div>
                )
            }
        </>
    )
}
