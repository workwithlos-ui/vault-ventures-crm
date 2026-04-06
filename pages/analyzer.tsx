import dynamic from 'next/dynamic';
const AnalyzerComp = dynamic(() => import('../src/components/AnalyzerPage'), { ssr: false });
export default function AnalyzerRoute() {
  return <AnalyzerComp />;
}
export async function getServerSideProps() {
  return { props: {} };
}
