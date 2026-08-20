import { New850VerticalPage } from '@/components/new850-vertical-page';
import { new850Verticals } from '@/lib/new850-platform';

export default function LoansPage() {
  return <New850VerticalPage vertical={new850Verticals.loans} />;
}
