import React from 'react'
import './table.css'
import api from "../utils/api"
import { useQuery } from 'react-query';


export default function MyItem() {

  const { isLoading , data } = useQuery(['getMyItems'], api.getMyItems.bind(api))

  if (isLoading) return 'fetched...'
  console.log({data})

  return (
    <div>
      <h>Item counts</h>
      <table class="tradetable">
        <thead>
          <tr>
            <th>Board games</th>
            <th>Playing card games</th>
            <th>Computer games</th>
            <th>Collectible card games</th>
            <th>Video games</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
        {data.result_count.map(data =>(
            <tr>
            <td>{data.boardGame}</td>
            <td>{data.playingCardGame}</td>
            <td>{data.computerGame}</td>
            <td>{data.collectibleCardGame}</td>
            <td>{data.videoGame}</td>
            <td>{data.total}</td>
            </tr>
          ))}
        </tbody>  
      </table>
      <br></br>

      <h>My Items</h>
      <table class="tradetable">
        <thead>
          <tr>
            <th>Item #</th>
            <th>Game type</th>
            <th>Title</th>
            <th>Condition</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
        {data.result_items.map(items =>(
            <tr key={items.item_no}>
            <td>{items.item_no}</td>
            <td>{items.game_type}</td>
            <td>{items.title}</td>
            <td>{items.condition}</td>
            <td>{items.description}</td>
            <td><a href={`/items/${items.item_no}`}>Detail</a></td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
  )
}
