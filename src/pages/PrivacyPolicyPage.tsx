import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function PrivacyPolicyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>プライバシーポリシー</CardTitle>
            <CardDescription>
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-left">
            <section>
              <h2 className="text-lg font-semibold mb-3 text-left">1. 収集する情報</h2>
              <p className="text-sm text-muted-foreground mb-4 text-left">
                本アプリケーションでは、以下の情報を収集・保存しています：
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 text-left">
                <li>予算設定</li>
                <li>予算期間</li>
                <li>収入/支出額</li>
                <li>日付</li>
                <li>メモ（説明文）</li>
                <li>支払い方法（支出の場合）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-left">2. 管理者によるデータ閲覧について</h2>
              <p className="text-sm text-muted-foreground mb-4 text-left">
                管理者は、サービス運営・改善・技術的な問題解決のため、データベースから以下の情報を閲覧することができます：
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 text-left">
                <li>予算設定</li>
                <li>予算期間</li>
                <li>収入/支出額</li>
                <li>日付</li>
                <li>メモ（説明文）</li>
                <li>支払い方法（支出の場合）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-left">3. プライバシー保護措置</h2>
              <div className="space-y-3 text-sm text-muted-foreground text-left">
                <p>
                  <strong className="text-foreground">ユーザーIDのハッシュ化：</strong>
                  データベース内でユーザーIDはSHA-256アルゴリズムを使用してハッシュ化されています。
                  これにより、管理者は収入/支出を登録したユーザー情報（メールアドレスなど）を紐づけることができません。
                </p>
                <p>
                  <strong className="text-foreground">Row Level Security (RLS)：</strong>
                  各ユーザーは自分のデータのみにアクセス可能です。他のユーザーのデータにアクセスすることはできません。
                </p>
                <p>
                  <strong className="text-foreground">アクセスログ：</strong>
                  管理者によるデータアクセスは記録され、適切に管理されています。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-left">4. データの利用目的</h2>
              <p className="text-sm text-muted-foreground text-left">
                収集したデータは、以下の目的でのみ使用されます：
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 mt-2 text-left">
                <li>サービスの提供・運営</li>
                <li>サービスの改善・機能追加</li>
                <li>技術的な問題の解決</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-left">5. お問い合わせ</h2>
              <p className="text-sm text-muted-foreground text-left">
                プライバシーポリシーに関するご質問やご意見がございましたら、
                <a
                  href="https://github.com/Umisyo/daily-budget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHubリポジトリ
                </a>
                までお問い合わせください。
              </p>
            </section>

            <div className="pt-4">
              <Link to="/">
                <Button className="w-full">
                  トップページに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

