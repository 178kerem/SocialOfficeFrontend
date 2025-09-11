import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function UserDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/User/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/User/${id}`);
      navigate("/users");
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName} kullanıcıyı sil?</h1>
      <button onClick={handleDelete}>Evet, Sil</button>
      <button onClick={() => navigate("/users")}>İptal</button>
    </div>
  );
}
