import Header from '@/components/blocks/header/header'
import { createFileRoute } from '@tanstack/react-router'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { User } from "lucide-react"
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InfoCard from '@/components/blocks/infoCard/infoCard'
import '../../assets/style/routes/plans.css'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloudinary } from '@/hooks/use-cloudinary'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { getPlans } from '@/apis/endpoints'
import { useError } from '../../hooks/use-error'


export const Route = createFileRoute('/_admin/plan')({
    component: () => <Plans />,
})


function Plans() {
    const [file, setFile] = useState<File | null>(null);
    const { uploadFile } = useCloudinary()

    const { error } = useError()

    // Step 1: Use useState to manage dialog open/close state
    const [isOpen, setIsOpen] = useState(false);

    // Step 2: Function to close the dialog
    const closeDialog = () => {
        setIsOpen(false);
    };

    const items = [
        {
            id: "kids",
            label: "Kids",
        },
        {
            id: "regular",
            label: "Regular",
        },
        {
            id: "amteur",
            label: "Amateur",
        },
        {
            id: "professional",
            label: "Professional",
        }
    ] as const
    const FormSchema = z.object({
        planType: z.enum(["children", "adult", "special"], {
            required_error: "The plan type is needed",
            invalid_type_error: "Please select a valid plan type",
        }),
        planName: z.string({
            required_error: "A plan name is required.",
        }).min(3, "Plan name should be at least 3 characters long"),

        priceInfo: z.string({
            required_error: "Information about the price is required.",
        }).min(3, "Price information should be at least 3 characters long"),  // Simple text validation

        description: z.string({
            required_error: "A brief description of the plan is required.",
        }).min(10, "Description should be at least 10 characters long"),

        note: z.string().optional(),  // Optional note field
        planPrice: z.number({
            required_error: "A plan price is needed",
        }).min(0, { message: "Plan price cannot be less than 0" }),
        filterPrams: z.array(z.string()).min(1, "You have to select at least one filter parameter.")  // Ensures at least one filter item is selected
    });
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            planType: "children",
            planName: "",
            priceInfo: "",
            description: "",
            note: "",
            filterPrams: ["kids"],
        },
    })

    const BillingFormSchema = z.object({
        billingName: z.string({
            required_error: "Add a billing name",
        }).min(4, { message: "Billing name should have at least 4 characters" })
            .max(100, { message: "Billing name cannot exceed 100 characters" }),

        currency: z.enum(['NGN'], {
            required_error: "A currency type is needed",
            invalid_type_error: "Invalid currency selected",
        }),

        interval: z.enum(['1', '3', '6', '12'], {
            required_error: "An interval is needed",
            invalid_type_error: "Invalid interval selected",
        }),

        discountPercentage: z.number({
            required_error: "A discount percentage is needed",
        }).min(0, { message: "Discount percentage cannot be less than 0" })
            .max(100, { message: "Discount percentage cannot exceed 100" }),
    });
    const Billingform = useForm<z.infer<typeof BillingFormSchema>>({
        resolver: zodResolver(BillingFormSchema),
        defaultValues: {
            billingName: "",
            interval: "1", // Default to 1-month interval
            currency: "NGN", // Default to NGN currency
            discountPercentage: 0,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]); // Set the selected file
            console.log(e.target.files[0])
        }
    };
    async function handleFile(data: z.infer<typeof FormSchema>) {
        const imageUrl = await uploadFile(file)
        // Send tournament data to backend
        try {
            const planData = {
                ...data,
                planImage: imageUrl, // Cloudinary URL from the image upload
            };
            console.log(planData)

            const response = await api.post('/plan/admin/createPlan', planData);
            console.log(response)
            closeDialog()
            form.reset()
            toast({
                variant: "default",
                title: "Membership Plan Created",
            });
        } catch (err) {
            error(err, "Error Creating Membership Plan")
        }
    }
    async function submitBilling(data: z.infer<typeof BillingFormSchema>, id: string) {
        try {
            console.log(data)
            const response = await api.post(`/plan/admin/createBillingPlan/${id}`, data);
            console.log(response)
            Billingform.reset()
            toast({
                variant: "default",
                title: "Billing Plan Created",
            });

        } catch (err) {
            error(err, "Error Creating Billing Plan")
        }
    }

    const queryClient = useQueryClient()
    const planQuery = useQuery({
        queryFn: getPlans,
        queryKey: ["plans"]
    })
    const planMutation = useMutation({
        mutationFn: handleFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    })
    const billingMutation = useMutation({
        mutationFn: ({ data, id }: { data: z.infer<typeof BillingFormSchema>; id: string }) => submitBilling(data, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    });





    return (
        <div className="plans">
            <Header title='Plans' subText='Create and manage your memebership plans here'>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default" onClick={() => {
                            form.reset()
                            setFile(null)
                        }}
                        >
                            Create Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[375px]">
                        <DialogHeader>
                            <DialogTitle>Create A Membership Plan</DialogTitle>
                            <DialogDescription>
                                Create a membership plan for your users
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form className="space-y-4 formPlan" onSubmit={form.handleSubmit((data) => planMutation.mutate(data))}>
                                <FormField
                                    control={form.control}
                                    name="planType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Plan Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {/* kids, regular,amateur, pro */}
                                                    <SelectItem value="children">Children</SelectItem>
                                                    <SelectItem value="adult">Adult</SelectItem>
                                                    <SelectItem value="special">Special </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="planName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Plan Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priceInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Infomation on price" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea placeholder="Plan description"{...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="planPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Plan's Price (per Month)"
                                                    {...field} value={field.value || ''} // Prevents uncontrolled to controlled input warning
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Leave at 0 if you want to use price on coach
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Notes on Plan (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>Upload Image</FormLabel>
                                    <Input type="file" onChange={handleFileChange} />
                                    <FormDescription>
                                        Upload an image of the Plan.
                                    </FormDescription>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="filterPrams"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Coach Filter</FormLabel>
                                                <FormDescription>
                                                    Select the coach type you want on this plan.
                                                </FormDescription>
                                            </div>
                                            {items.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="filterPrams"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={item.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, item.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== item.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {item.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <br />
                                <div className="bttnWrap">
                                    <Button className='bttnPlan' disabled={planMutation.isPending} type="submit">
                                        {
                                            planMutation.isPending ? "Creating Plan..." : "Create Plan"
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </Header>

            <div className="userContent">
                <div className="userrDataTop ">
                    <InfoCard title="Plans" info={planQuery?.data?.length} extraInfo='Created Plans'>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </InfoCard>
                </div>

                <div className="userContent">
                    <div className="pWrap">
                        {
                            planQuery.data ? (
                                planQuery.data.map((item, index) => {
                                    return (
                                        <Card key={index + "pKey"} className="pCard">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <div className="lHeader">
                                                    <div className="tourImg">
                                                        <img src={item.planImage} alt="" />
                                                    </div>

                                                    <div className="pBoxTop">
                                                        <CardTitle className="text-sm font-large">{item.planName}</CardTitle>
                                                        <div className="planPillsWrap">
                                                            {
                                                                item.filterPrams.map((value) => {
                                                                    return (
                                                                        <div key={"va" + value} className={`pPill ${value}`}>
                                                                            <p>{value}</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* {children} */}
                                            </CardHeader>

                                            <CardContent>
                                                <br />
                                                <p className="text-xs text-muted-foreground">{item.billingPlans?.length > 0 ? "Created Plans" : "No billings cycle created"}</p>

                                                {
                                                    item.billingPlans.map((bill, index) => {
                                                        return (
                                                            <div className="planBox">
                                                                <p>{bill.billingName}</p>
                                                                <p className="text-xs text-muted-foreground">{`at a discount of ${bill.discountPercentage}%`}</p>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </CardContent>

                                            <CardFooter>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="default" onClick={() => {
                                                            Billingform.reset()
                                                        }}
                                                        >
                                                            Manage Billings
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[375px]">
                                                        <DialogHeader>
                                                            <DialogTitle>{item.planName}</DialogTitle>
                                                            <DialogDescription>
                                                                Create a billing cycle for the seclected plan
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Form {...Billingform}>
                                                            <form className="space-y-4 " onSubmit={Billingform.handleSubmit((data) => billingMutation.mutate({ data, id: item._id }))}>
                                                                <FormField
                                                                    control={Billingform.control}
                                                                    name="billingName"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input placeholder="Billing Plan" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={Billingform.control}
                                                                    name="currency"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select a Currency" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="NGN">NGN</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={Billingform.control}
                                                                    name="interval"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select an Interval" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="1">Every 1 month</SelectItem>
                                                                                    <SelectItem value="3">Every 3 months</SelectItem>
                                                                                    <SelectItem value="6">Every 6 months</SelectItem>
                                                                                    <SelectItem value="12">Every 12 months</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />



                                                                <FormField
                                                                    control={Billingform.control}
                                                                    name="discountPercentage"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type='number'
                                                                                    placeholder="Discount Percentage"
                                                                                    {...field}
                                                                                    value={field.value || ''} // Prevents uncontrolled to controlled input warning
                                                                                    onChange={(e) => field.onChange(Number(e.target.value))} // Convert to number here
                                                                                />
                                                                            </FormControl>
                                                                            <FormDescription>
                                                                                The final price will be caculated based on the values above
                                                                            </FormDescription>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <div className="bttnWrap">
                                                                    <Button className='bttnPlan' disabled={billingMutation.isPending} type="submit">
                                                                        {
                                                                            billingMutation.isPending ? "Creating Billing Plan.." : "Create Billing"
                                                                        }
                                                                    </Button>
                                                                </div>
                                                            </form>
                                                        </Form>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardFooter>
                                        </Card>
                                    )
                                })
                            ) : (
                                <h2>No data</h2>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}