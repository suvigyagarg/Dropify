"use client"

import {useForm} from "react-hook-form"
import { SignUp, useSignUp } from "@clerk/nextjs"
import {z} from "zod"
//custom schema
import { signUpSchema } from "@/schemas/signUpSchema"
import  { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

export default function signUpForm(){
    const router = useRouter()
    const [verifying ,setverifying] =useState(false)
    const[isSubmitting , setIsSubmitting] =useState(false)
    const [ authError ,setAuthError ] =useState<string|null >(null)
    const [verificationeError ,setVerificationError] =useState<string|null >(null)
    const [verificationCode ,setVerificationCode] =useState("")
    const {signUp , isLoaded , setActive}= useSignUp()
    

 const {
    register,
    handleSubmit,
    formState:{errors},
    
 } =useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues:{
        email:"",
        password:"",
        passwordConfirmation: "",
    }
 });


    const onSubmit = async (data: z.infer<typeof signUpSchema >)=>{
        if (!isLoaded) return ;
        setIsSubmitting(true)
        setAuthError(null)
        try {
         await signUp.create({
            emailAddress:data.email,
            password:data.password
          })  
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code"
          })
          setverifying(true)
        } catch (error:any) {
            setAuthError(
                error.errors?.[0]?.message || "An error occured during the signup try again"
            )
        }finally{
            setIsSubmitting(true)
        }
    }

    const handleVerificationSubmit = async (e:React.FormEvent<HTMLFormElement>)=>{

        e.preventDefault()
        if(!isLoaded || !SignUp) return
         setIsSubmitting(true)
        setAuthError(null)

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            console.log(result)

            if(result.status ==="complete"){
                await setActive({
                    session: result.createdSessionId
                })
                router.push("/dashboard")
            }else{
                console.error("verification Incomplete", result)
                setVerificationError(
                    "Verification could not be completed"
                )
            }

        } catch (error:any) {
             console.error("verification Incomplete", error)
            setVerificationError(
                 error.errors?.[0]?.message || "An error occured during the signup try again"
            )
        }finally{
            setIsSubmitting(false)
        }
    }
   
    if(verifying){
        return(
           <h1>This is OTP entering field</h1> 
        )
    }

    return(
        <h1>signup form with email and other fields</h1>
    )

}