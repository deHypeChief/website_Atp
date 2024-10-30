import { createFileRoute, useNavigate } from '@tanstack/react-router'
import '../../assets/style/routes/index.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Header3, Paragraph } from '@/components/typography'
import { Fingerprint } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/_auth/createAdmin')({
  component: () => <CreateAdmin />,
})

const formSchema = z.object({
  adminFirstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(30, { message: "First name should not exceed 30 characters" }),
  adminLastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(30, { message: "Last name should not exceed 30 characters" }),
  adminEmail: z
    .string()
    .email({ message: "Enter a valid email address" })
    .nonempty({ message: "Email is required" }),
  pin: z
    .string()
    .length(6, { message: "PIN must be exactly 6 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
      message: "PIN must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

function CreateAdmin() {
  const { adminRegister } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const { mutateAsync: signAdminMutation, isPending } = useMutation({
    mutationFn: adminRegister,
    onSuccess: (data) => {
		console.log(data)
    toast({
      variant: "default",
      title: "Admin Created",
    })
		navigate({to: "/"})
    },
    onError: (err) => {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Admin Creation Error",
        description: err.response.data.message || err.message,
      })
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      pin: '',
    },
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    await signAdminMutation({
      adminName: `${values.adminFirstName} ${values.adminLastName}`,
      adminEmail: values.adminEmail,
      pin: values.pin
    })
  }

  return (
    <section className="auth">
      <div className="authWrap">
        <div className="authIcon">
          <Fingerprint size={40} />
        </div>
        <div className="authInfo">
          <Header3>Welcome Back</Header3>
          <Paragraph>Let's login into your account.</Paragraph>
        </div>
        <div className="authForm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>

              <div className="formWrap">
                <FormField
                  control={form.control}
                  name="adminFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AdminPin</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your pin"
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="formAction">
                <Button type="submit" disabled={isPending}>
                  {
                    isPending ? "Creating Admin.." : "Register Admin"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}
