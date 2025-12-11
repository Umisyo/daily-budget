/**
 * ユーザーIDをハッシュ化する関数
 * データベース側と同じアルゴリズムを使用（SHA-256）
 */
/**
 * ユーザーIDをハッシュ化
 * ブラウザ環境ではWeb Crypto APIを使用
 */
export async function hashUserId(userId: string): Promise<string> {
  // 環境変数からソルトを取得
  const salt = import.meta.env.VITE_HASH_SALT;
  
  if (!salt) {
    throw new Error(
      'VITE_HASH_SALT environment variable is not set. ' +
      'Please set it in your .env file.'
    );
  }
  
  // Web Crypto APIを使用
  const encoder = new TextEncoder()
  const data = encoder.encode(userId + salt)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

