import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formUser, setFormUser] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/User/${id}`);
        setFormUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser({ ...formUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/User", formUser);
      navigate("/users");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Kullanıcıyı Güncelle</h1>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="Ad" value={formUser.firstName} onChange={handleChange} />
        <input name="lastName" placeholder="Soyad" value={formUser.lastName} onChange={handleChange} />
        <input name="email" placeholder="Email" value={formUser.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Yeni Şifre" value={formUser.password} onChange={handleChange} />
        <input name="phone" placeholder="Telefon" value={formUser.phone} onChange={handleChange} />
        <button type="submit">Güncelle</button>
      </form>
    </div>
  );
}
