import React from 'react'
import './table.css'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom';
import api from "../utils/api"


export default function TradeDetails() {

    let { tradeId } = useParams();
    console.log({tradeId})
    const { isLoading , data } = useQuery(['tradeDetails', tradeId], () => api.tradeDetails(tradeId))


  if (isLoading) return 'fetched...'
  console.log({data})
  
  return (
    <div>
      <table class="detailtable">
        <thead>
          <tr>
            <th>Trade Details</th>
          </tr>
        </thead>
        <tbody>
          {data.result_status.map(hist =>(
            <tr>
            <td><b>Proposed</b></td>
            <td>{hist.Proposed_Date}</td></tr>
          ))}
          {data.result_status.map(hist =>(
            <tr>
            <td><b>Accepted/Rejected</b></td>
            <td>{hist.Transaction_Date}</td></tr>
          ))}
          {data.result_status.map(hist =>(
            <tr>
            <td><b>Status</b></td>
            <td>{hist.trade_Status}</td></tr>
          ))}
          {data.result_status.map(hist =>(
            <tr>
            <td><b>My Role</b></td>
            <td>{hist.Role}</td></tr>
          ))}
          {data.result_status.map(hist =>(
            <tr>
            <td><b>Response Time</b></td>
            <td>{hist.Response} days</td></tr>
          ))}
        </tbody>  
      </table>
      <br></br>
      <table class="detailtable">
        <thead>
          <tr>
            <th>User Details</th>
          </tr>
        </thead>
        <tbody>
          {data.result_other.map(hist =>(
            <tr>
            <td><b>Nickname</b></td>
            <td>{hist.Nickname}</td></tr>
          ))}
          {data.result_other.map(hist =>(
            <tr>
            <td><b>Distance</b></td>
            <td>{hist.distance}</td></tr>
          ))}
          {data.result_other.map(hist =>(
            <tr>
            <td><b>Name</b></td>
            <td>{hist.First_Name}</td></tr>
          ))}
          {data.result_other.map(hist =>(
            <tr>
            <td><b>Email</b></td>
            <td>{hist.Email}</td></tr>
          ))}
        </tbody>  
      </table>
      <br></br>
      <table class="detailtable">
        <thead>
          <tr>
            <th>Proposed Item</th>
          </tr>
        </thead>
        <tbody>
          {data.result_pp.map(hist =>(
            <tr>
            <td><b>Item No.</b></td>
            <td>{hist.item_no}</td></tr>
          ))}
          {data.result_pp.map(hist =>(
            <tr>
            <td><b>Title</b></td>
            <td>{hist.title}</td></tr>
          ))}
          {data.result_pp.map(hist =>(
            <tr>
            <td><b>Game Type</b></td>
            <td>{hist.game_type}</td></tr>
          ))}
          {data.result_pp.map(hist =>(
            <tr>
            <td><b>Condition</b></td>
            <td>{hist.condition}</td></tr>
          ))}
          {data.result_pp.map(hist =>(
            <tr>
            <td><b>Description</b></td>
            <td>{hist.description}</td></tr>
          ))}
        </tbody>  
      </table>
      <br></br>
      <table class="detailtable">
        <thead>
          <tr>
            <th>Desired Item</th>
          </tr>
        </thead>
        <tbody>
          {data.result_cp.map(hist =>(
            <tr key={hist.t_id}>
            <td><b>Item No.</b></td>
            <td>{hist.item_no}</td></tr>
          ))}
          {data.result_cp.map(hist =>(
            <tr key={hist.t_id}>
            <td><b>Title</b></td>
            <td>{hist.title}</td></tr>
          ))}
          {data.result_cp.map(hist =>(
            <tr key={hist.t_id}>
            <td><b>Game Type</b></td>
            <td>{hist.game_type}</td></tr>
          ))}
          {data.result_cp.map(hist =>(
            <tr key={hist.t_id}>
            <td><b>Condition</b></td>
            <td>{hist.condition}</td></tr>
          ))}
        </tbody>  
      </table>
  </div>
  )
}