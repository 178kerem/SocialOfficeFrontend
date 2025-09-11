import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function UserRead() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/User");
      setUsers(res.data);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Kullanıcılar</h1>
      <Link to="/users/create">
        <button>Yeni Kullanıcı Ekle</button>
      </Link>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.firstName} {u.lastName} - {u.email} - {u.phone}
            <Link to={`/users/update/${u.id}`}>
              <button>Düzenle</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
