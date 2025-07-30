import { useState, useEffect } from 'react';
import 'primeicons/primeicons.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getUser } from '../types/UserService';
import type { UserObj } from '../types/UserObj';
import './UserCard.css';
import { InputNumber } from 'primereact/inputnumber';

export default function UserCard() {
  const [users, setUsers] = useState<UserObj[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows] = useState(12);
  const [selectCount, setSelectCount] = useState<number>(0);
  const [allFetchedUsers, setAllFetchedUsers] = useState<UserObj[]>([]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const { data, total } = await getUser(page);
      setUsers(data);
      setTotalRecords(total);

      // Avoid duplicates
      setAllFetchedUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const newData = data.filter((u) => !existingIds.has(u.id));
        return [...prev, ...newData];
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const onPage = (e: any) => {
    const pageNumber = e.first / e.rows + 1;
    setFirst(e.first);
    fetchData(pageNumber);
  };

  const onSelectionChange = (e: any) => {
    setSelectedUsers(e.value);
    setSelectCount(e.value.length);
  };

  const handleSelectByCount = async () => {
    let fetched = [...allFetchedUsers];

    let currentPage = 1;
    while (fetched.length < selectCount) {
      const { data } = await getUser(currentPage);
      const newItems = data.filter((item) => !fetched.find((u) => u.id === item.id));
      fetched = [...fetched, ...newItems];
      currentPage++;
      if (data.length === 0) break; 
    }

    setAllFetchedUsers(fetched);
    const selected = fetched.slice(0, selectCount);
    setSelectedUsers(selected);
  };

  return (
    <div className="card">
      <h2 className="title">Data</h2>
      <hr />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <InputNumber
          value={selectCount}
          onValueChange={(e) => setSelectCount(e.value || 0)}
          placeholder="Select rows (count)"
          min={0}
          className="transparent-input"
        />
        <button onClick={handleSelectByCount} className="select">
          <i className="pi pi-check" style={{ fontSize: '1rem', fontWeight: 'bold' }}></i>
        </button>
        <span className="selected-count">Selected: {selectedUsers.length}</span>
      </div>

      <DataTable
        value={users}
        selection={selectedUsers}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        paginator
        rows={rows}
        lazy
        totalRecords={totalRecords}
        loading={loading}
        first={first}
        onPage={onPage}
        selectionMode="multiple"
        
      >
        <Column selectionMode="multiple" headerStyle={{ width: '1rem' }} />
        <Column field="title" header="Title" className="custom-column" />
        <Column field="artist_display" header="Artist" className="custom-column" />
        <Column field="place_of_origin" header="Place of Origin" className="custom-column" />
        <Column field="date_start" header="Start Date" className="custom-column" />
        <Column field="date_end" header="End Date" className="custom-column" />
      </DataTable>

      <hr />
    </div>
  );
}
