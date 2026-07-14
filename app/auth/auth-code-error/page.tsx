import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
          登录失败
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          很抱歉，Google 登录过程中出现了错误。请重试或使用邮箱登录。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
