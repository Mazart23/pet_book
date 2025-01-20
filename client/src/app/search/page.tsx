import { Metadata } from "next";
import SearchForm from "../../components/Search/searchForm";


export const metadata: Metadata = {
  title: "Search Page",
};

export default function SearchPage() {
  return (
    <div>
      <SearchForm />
    </div>
  );
}
