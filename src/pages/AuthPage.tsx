import { LoginForm } from '../components/auth/LoginForm'
import { SignUpForm } from '../components/auth/SignUpForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-background' value="login">ログイン</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-background' value="signup">新規登録</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

