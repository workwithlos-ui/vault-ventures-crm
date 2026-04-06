import dynamic from 'next/dynamic';

const LoginComp = dynamic(() => import('../src/components/LoginPage'), { ssr: false });

export default function LoginRoute() {
  return <LoginComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
