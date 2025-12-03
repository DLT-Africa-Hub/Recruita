import { useEffect, useState } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallControls,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface StreamVideoCallProps {
  apiKey: string;
  token: string;
  callId: string;
  userName: string;
  userId: string;
}

const StreamVideoCall = ({
  apiKey,
  token,
  callId,
  userName,
  userId,
}: StreamVideoCallProps) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!apiKey || !token || !callId) {
      return;
    }

    const myClient = new StreamVideoClient({ 
      apiKey, 
      user: { id: userId, name: userName }, 
      token 
    });
    setClient(myClient);

    const myCall = myClient.call('default', callId);
    setCall(myCall);

    // Join the call
    myCall.join({ create: true }).catch((error) => {
      console.error('Error joining call:', error);
    });

    return () => {
      myCall.leave().catch(console.error);
      myClient.disconnectUser();
    };
  }, [apiKey, token, callId, userId, userName]);

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <p>Connecting to video call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <SpeakerLayout participantsBarPosition="bottom" />
          <CallControls onLeave={() => window.history.back()} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
};

export default StreamVideoCall;

