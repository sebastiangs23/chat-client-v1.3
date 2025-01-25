import { useEffect, useState, useRef } from "react";
import Parse from "parse";

Parse.initialize("106", "r:2060274cdd42ec44c7d924766fd12e0f");
Parse.serverURL = "http://localhost:2337/server";

export default function NotificationsLicence() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Controla si el menú está abierto
  const subscriptionNotificationsRef = useRef(null);

  useEffect(() => {
    const fetchMessagesAndSubscribe = async () => {
      try {
        const Notifications = Parse.Object.extend("notificationsUsers");
        const query = new Parse.Query(Notifications);

        // Cargar datos históricos
        const data = await query.find();
        if (data) {
          const notificationsHistory = await Promise.all(
            data.map(async (not) => ({
              id: not.id,
              notDescription: not.get("notDescription") || "Sin descripción",
              notSeen: not.get("notSeen"),
              notSeenAt: not.get("notSeenAt"),
              notUserId: await resolvePointer(not.get("notUserId")), // Resolver el Pointer
            }))
          );

          setNotifications(notificationsHistory);
        }

        // Configurar la suscripción a Parse LiveQuery
        const subscriptionNotifications = await query.subscribe();
        subscriptionNotificationsRef.current = subscriptionNotifications;

        // Escuchar nuevos mensajes en tiempo real
        subscriptionNotifications.on("create", async (not) => {
          const newNotification = {
            id: not.id,
            notDescription: not.get("notDescription") || "Sin descripción",
            notSeen: not.get("notSeen"),
            notSeenAt: not.get("notSeenAt"),
            notUserId: await resolvePointer(not.get("notUserId")), // Resolver el Pointer
          };

          setNotifications((prevNotifications) => [
            ...prevNotifications,
            newNotification,
          ]);
        });
      } catch (error) {
        console.log("Error al obtener los mensajes o suscribirse:", error);
      }
    };

    fetchMessagesAndSubscribe();

    return () => {
      if (subscriptionNotificationsRef.current) {
        subscriptionNotificationsRef.current.unsubscribe();
      }
    };
  }, []);

  const resolvePointer = async (pointer) => {
    if (!pointer || !pointer.objectId) return "Usuario desconocido";
    try {
      const query = new Parse.Query("_User");
      const user = await query.get(pointer.objectId); // Resolver el Pointer
      return user ? user.get("username") : "Usuario desconocido";
    } catch (error) {
      console.error("Error al resolver el pointer del usuario:", error);
      return "Usuario desconocido";
    }
  };

  // Contar notificaciones no vistas
  const unseenCount = notifications.filter((not) => !not.notSeen).length;

  // Alternar visibilidad del menú
  const toggleMenu = () => setIsOpen((prevState) => !prevState);

  return (
    <div>
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Campanita */}
        <div
          onClick={toggleMenu}
          style={{
            cursor: "pointer",
            position: "relative",
            fontSize: "24px",
          }}
        >
          🔔
          {unseenCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "4px 8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {unseenCount}
            </span>
          )}
        </div>

        {/* Menú desplegable */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "0",
              backgroundColor: "white",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {notifications.length === 0 ? (
              <p
                style={{
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                No hay notificaciones
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <p style={{ margin: 0 }}>{item.notDescription}</p>
                  <small>Usuario: {item.notUserId}</small>
                  <br />
                  <small>Visto: {item.notSeen ? "Sí" : "No"}</small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
