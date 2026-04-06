import dynamic from 'next/dynamic';
const DueDiligenceComp = dynamic(() => import('../src/components/DueDiligencePage'), { ssr: false });
export default function DueDiligenceRoute() {
  return <DueDiligenceComp />;
}
export async function getServerSideProps() {
  return { props: {} };
}
