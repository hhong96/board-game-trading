import { Routes, Route, Navigate } from "react-router-dom";
import MainMenu from "./MainMenu";
import Login from "./Login";
import Register from "./Register";
import TradeHistory from "./TradeHistory";
import ViewItem from "./ViewItem";
import TradeDetails from "./TradeDetails";
import MyItems from "./MyItems";
import ListItem from "./ListItem";
import Search from "./Search";
import { SearchTable } from "./Search";
import ProposeTrade from "./ProposeTrade";
import ProtectedRoute from "../utils/ProtectedRoute";
import PublicRoute from "../utils/PublicRoute";
import StandardLayout from "./utils/StandardLayout";
import { useParams } from 'react-router-dom';

export default function App() {
  const { tradeId } = useParams()
  return (
    <Routes>
      
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/menu" element={<MainMenu />} />

        <Route element={<StandardLayout />}>

          <Route path="/items/search" element={<Search />} />
          <Route path="/items/searchTable" element={<SearchTable />} />
          <Route path="/items/:itemNo/trade/new" element={<ProposeTrade/>} />
          <Route path="/items/:itemNo" element={<ViewItem />} />
          <Route path="/items" element={<MyItems />} />
          <Route path="/items/list" element={<ListItem />} />
          <Route path="/trades/:tradeId" element={<TradeDetails />} />
          <Route path="/trades" element={<TradeHistory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
