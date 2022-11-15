import React from 'react'
import './table.css'
import api from "../utils/api"
import { useQuery } from 'react-query';


export default function TradeHistory() {

  const { isLoading , data } = useQuery(['tradeHistory'], api.tradeHistory.bind(api))

  if (isLoading) return 'fetched...'
  console.log({data})

  

  return (
    <div>
      <h>TradeHistory</h>
      <table class="tradetable">
        <thead>
          <tr>
            <th>My Role</th>
            <th>Total</th>
            <th>Accepted</th>
            <th>Rejected</th>
            <th>Rejected %</th>
          </tr>
        </thead>
        <tbody>
        {data.result.map(data =>(
            <tr>
            <td>{data.role}</td>
            <td>{data.tot}</td>
            <td>{data.acptd}</td>
            <td>{data.rjctd}</td>
            <td>{data.rjctd_pct}</td>
            </tr>
          ))}
        </tbody>  
      </table>
      <br></br>
      <table class="tradetable">
        <thead>
          <tr>
            <th>Proposed Date</th>
            <th>Accepted/Rejected Date</th>
            <th>Trade Status</th>
            <th>Resonse time (days)</th>
            <th>My Role</th>
            <th>Proposed Item</th>
            <th>Desired Item</th>
            <th>Other User</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
        {data.result_hist.map(hist =>(
            <tr key={hist.t_id}>
            <td>{hist.p_dt}</td>
            <td>{hist.t_dt}</td>
            <td>{hist.status}</td>
            <td>{hist.res_time}</td>
            <td>{hist.role}</td>
            <td>{hist.p_item}</td>
            <td>{hist.d_item}</td>
            <td>{hist.other_user}</td>
            <td><a href={`/trades/${hist.t_id}`}>Detail</a></td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
  )
}
