import { useEffect } from "react"
import Parse from "parse"

export const useChat = ({chatroomId, clientId}) => {
    useEffect(() => {
    
        // Ahora establecemos una conexión con la colección "Chat_Message" de la BDD
        const ChatMessage = Parse.Object.extend('chatMessage')
        const query = new Parse.Query(ChatMessage)
        query.equalTo('chatroomId', chatroomId)
    
        // Lo primero es buscar todo los mensajes previos para nuestro chat
        query.find().then((data) => {
          if (data) {
            const messagesHistory = data
              .filter((message) => message.get('content') !== '') // <---- Validamos que todos los mensajes tengan contenido
              .map(
                (message) =>
                  ({
                    content: message.get('content'),
                    clientId: message.get('clientId'),
                    chatroomId: message.get('chatroomId'),
                    createdAt: message.get('createdAt'),
                  })
              )
            setMessages(messagesHistory)
            setLoadingChat(false)
          }
        })
    
        // Luego nos suscribimos con nuestro cliente para escuchar cualquier actualización en esta colección
        const subscriptionMessage = clientRef.current.subscribe(query)
        subscriptionMessageRef.current = subscriptionMessage
    
        // Cuando se crea un mensaje lo agregamos al array del estado "message"
        subscriptionMessage.on('create', (message) => {
          setMessages((prevState) => [
            ...prevState,
            {
              content: message.get('content'),
              clientId: message.get('clientId'),
              chatroomId: message.get('chatroomId'),
              createdAt: message.get('createdAt'),
            },
          ])
          setLoadingChat(false)
        })
    
        // Limpiamos la suscripción cuando el componente se desmonta
        return () => {
          subscriptionMessageRef.current.unsubscribe()
        }
      }, [chatroomId, clientId])
}



