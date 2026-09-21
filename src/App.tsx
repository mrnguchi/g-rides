import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MOCK_CONVERSATIONS } from './constants/mockChats';
import { MOCK_NOTIFICATIONS } from './constants/mockNotifications';
import { MOCK_USER_VEHICLES } from './constants/mockUserVehicles';
import { BONASSAMA_COORDINATE } from './constants/mockVehicles';
import {
  ActivityScreen,
  CarDetailScreen,
  ChatScreen,
  DiscoverScreen,
  ForgotPasswordScreen,
  HomeScreen,
  LoginScreen,
  MessagesScreen,
  MyVehiclesScreen,
  OnboardingOneScreen,
  OnboardingThreeScreen,
  OnboardingTwoScreen,
  PasswordResetSuccessScreen,
  ProfileScreen,
  RentalDetailsScreen,
  ResetPasswordScreen,
  RoleSelectionScreen,
  SignUpScreen,
  SplashScreen,
  WelcomeScreen,
  VerifyCodeScreen,
} from './screens';
import type { MessageDeliveryStatus } from './types/chat';
import type { BookingRequest } from './types/booking';
import type { Coordinate, Vehicle } from './types/map';
import type { MainTab } from './types/navigation';
import type { RentalRecord } from './types/rental';
import type { UserRole } from './types/user';
import type { UserVehicle } from './types/vehicle';

const SPLASH_DURATION_MS = 1800;

type AuthScreen =
  | 'activity'
  | 'carDetail'
  | 'chat'
  | 'discover'
  | 'forgotPassword'
  | 'garage'
  | 'home'
  | 'login'
  | 'messages'
  | 'passwordResetSuccess'
  | 'profile'
  | 'rentalDetail'
  | 'resetPassword'
  | 'signUp'
  | 'verifyCode'
  | 'welcome';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [isRoleSelectionVisible, setIsRoleSelectionVisible] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen | null>(null);
  const [chatReturnScreen, setChatReturnScreen] =
    useState<'carDetail' | 'messages' | 'rentalDetail'>('messages');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeRole, setActiveRole] = useState<UserRole>('renter');
  const [userRoles, setUserRoles] = useState<UserRole[]>(['renter']);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([
    ...MOCK_USER_VEHICLES,
  ]);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [selectedRental, setSelectedRental] = useState<RentalRecord>();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [selectedVehicleOrigin, setSelectedVehicleOrigin] =
    useState<Coordinate>();
  const [vehicleDetailReturnScreen, setVehicleDetailReturnScreen] =
    useState<'activity' | 'chat' | 'discover' | 'home' | 'rentalDetail'>('home');
  const messageStatusTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const selectedConversation = conversations.find(
    ({ id }) => id === selectedConversationId,
  );
  const selectedVehicleBookingRequest = bookingRequests.find(
    (request) => request.vehicle.id === selectedVehicle?.id,
  );
  const unreadMessagesCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  const navigateToMainTab = (tab: MainTab) => {
    if (
      tab === 'home' ||
      tab === 'discover' ||
      tab === 'activity' ||
      tab === 'messages' ||
      tab === 'profile'
    ) {
      setAuthScreen(tab);
    }
  };

  const openConversation = (
    conversationId: string,
    returnScreen: 'carDetail' | 'messages' | 'rentalDetail' = 'messages',
  ) => {
    setChatReturnScreen(returnScreen);
    setSelectedConversationId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );
    setAuthScreen('chat');
  };

  const updateMessageStatus = (
    conversationId: string,
    messageId: string,
    status: MessageDeliveryStatus,
  ) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.id === messageId ? { ...message, status } : message,
              ),
            }
          : conversation,
      ),
    );
  };

  const sendMessage = (conversationId: string, text: string) => {
    const messageId = `local-${Date.now()}`;
    const participantOnline = conversations.find(
      ({ id }) => id === conversationId,
    )?.participant.isOnline;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: messageId,
                  sender: 'me' as const,
                  sentAt: new Date().toISOString(),
                  status: 'sent' as const,
                  text,
                },
              ],
            }
          : conversation,
      ),
    );

    const deliveredTimer = setTimeout(
      () => updateMessageStatus(conversationId, messageId, 'delivered'),
      450,
    );
    messageStatusTimersRef.current.push(deliveredTimer);

    if (participantOnline) {
      const readTimer = setTimeout(
        () => updateMessageStatus(conversationId, messageId, 'read'),
        1300,
      );
      messageStatusTimersRef.current.push(readTimer);
    }
  };

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(
    () => () => {
      messageStatusTimersRef.current.forEach(clearTimeout);
    },
    [],
  );

  return (
    <SafeAreaProvider>
      {isSplashVisible || (!fontsLoaded && !fontError) ? (
        <SplashScreen />
      ) : authScreen === 'carDetail' &&
        selectedVehicle &&
        selectedVehicleOrigin ? (
        <CarDetailScreen
          bookingRequest={selectedVehicleBookingRequest}
          onBack={() => setAuthScreen(vehicleDetailReturnScreen)}
          onBookingRequestCanceled={(requestId) =>
            setBookingRequests((current) =>
              current.filter((request) => request.id !== requestId),
            )
          }
          onBookingRequestSubmitted={(request) =>
            setBookingRequests((current) => [
              ...current.filter(
                (currentRequest) =>
                  currentRequest.vehicle.id !== request.vehicle.id,
              ),
              request,
            ])
          }
          onMessageOwner={() =>
            openConversation('chat-owner-munoh', 'carDetail')
          }
          userLocation={selectedVehicleOrigin}
          vehicle={selectedVehicle}
        />
      ) : authScreen === 'chat' && selectedConversation ? (
        <ChatScreen
          conversation={selectedConversation}
          onBack={() => setAuthScreen(chatReturnScreen)}
          onOpenVehicle={
            selectedConversation.vehicle
              ? () => {
                  setSelectedVehicle(selectedConversation.vehicle);
                  setSelectedVehicleOrigin(BONASSAMA_COORDINATE);
                  setVehicleDetailReturnScreen('chat');
                  setAuthScreen('carDetail');
                }
              : undefined
          }
          onSendMessage={(text) => sendMessage(selectedConversation.id, text)}
        />
      ) : authScreen === 'discover' ? (
        <DiscoverScreen
          onOpenVehicle={(vehicle, userLocation) => {
            setSelectedVehicle(vehicle);
            setSelectedVehicleOrigin(userLocation);
            setVehicleDetailReturnScreen('discover');
            setAuthScreen('carDetail');
          }}
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'messages' ? (
        <MessagesScreen
          conversations={conversations}
          onOpenConversation={(conversationId) =>
            openConversation(conversationId, 'messages')
          }
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'rentalDetail' && selectedRental ? (
        <RentalDetailsScreen
          onBack={() => setAuthScreen('activity')}
          onContactSupport={() =>
            openConversation('chat-g-rides-support', 'rentalDetail')
          }
          onFindCars={() => setAuthScreen('discover')}
          onManageRental={() => setAuthScreen('activity')}
          onMessageOwner={() =>
            openConversation('chat-owner-munoh', 'rentalDetail')
          }
          onViewCar={() => {
            setSelectedVehicle(selectedRental.vehicle);
            setSelectedVehicleOrigin(BONASSAMA_COORDINATE);
            setVehicleDetailReturnScreen('rentalDetail');
            setAuthScreen('carDetail');
          }}
          rental={selectedRental}
        />
      ) : authScreen === 'activity' ? (
        <ActivityScreen
          onOpenRental={(rental) => {
            setSelectedRental(rental);
            setAuthScreen('rentalDetail');
          }}
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'profile' ? (
        <ProfileScreen
          activeRole={activeRole}
          enabledRoles={userRoles}
          notificationCount={notifications.filter(({ read }) => !read).length}
          onLogout={() => setAuthScreen('welcome')}
          onOpenGarage={() => setAuthScreen('garage')}
          onRoleChange={setActiveRole}
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'garage' ? (
        <MyVehiclesScreen
          activeRole={activeRole}
          onBack={() => setAuthScreen('profile')}
          onSaveVehicle={(vehicle) =>
            setUserVehicles((current) => [
              ...current.filter(
                (currentVehicle) => currentVehicle.id !== vehicle.id,
              ),
              vehicle,
            ])
          }
          vehicles={userVehicles}
        />
      ) : authScreen === 'home' ? (
        <HomeScreen
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
          onMarkAllNotificationsRead={() =>
            setNotifications((current) =>
              current.map((notification) => ({
                ...notification,
                read: true,
              })),
            )
          }
          onMarkNotificationRead={(notificationId) =>
            setNotifications((current) =>
              current.map((notification) =>
                notification.id === notificationId
                  ? { ...notification, read: true }
                  : notification,
              ),
            )
          }
          onOpenVehicle={(vehicle, userLocation) => {
            setSelectedVehicle(vehicle);
            setSelectedVehicleOrigin(userLocation);
            setVehicleDetailReturnScreen('home');
            setAuthScreen('carDetail');
          }}
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'forgotPassword' ? (
        <ForgotPasswordScreen
          onBack={() => setAuthScreen('login')}
          onContinue={(identifier) => {
            setResetIdentifier(identifier);
            setAuthScreen('verifyCode');
          }}
        />
      ) : authScreen === 'verifyCode' ? (
        <VerifyCodeScreen
          identifier={resetIdentifier}
          onBack={() => setAuthScreen('forgotPassword')}
          onVerify={() => setAuthScreen('resetPassword')}
        />
      ) : authScreen === 'resetPassword' ? (
        <ResetPasswordScreen
          onBack={() => setAuthScreen('verifyCode')}
          onResetPassword={() => setAuthScreen('passwordResetSuccess')}
        />
      ) : authScreen === 'passwordResetSuccess' ? (
        <PasswordResetSuccessScreen onLogin={() => setAuthScreen('login')} />
      ) : authScreen === 'login' ? (
        <LoginScreen
          onForgotPassword={() => setAuthScreen('forgotPassword')}
          onLogin={() => setAuthScreen('home')}
          onSignUp={() => setAuthScreen('signUp')}
        />
      ) : authScreen === 'signUp' ? (
        <SignUpScreen
          onLogin={() => setAuthScreen('login')}
          onSignUp={() => setAuthScreen('home')}
        />
      ) : authScreen === 'welcome' ? (
        <WelcomeScreen
          onLogin={() => setAuthScreen('login')}
          onSignUp={() => setAuthScreen('signUp')}
        />
      ) : isRoleSelectionVisible ? (
        <RoleSelectionScreen
          onContinue={(roles) => {
            setUserRoles(roles);
            setActiveRole(roles.includes('renter') ? 'renter' : roles[0]);
            setAuthScreen('welcome');
          }}
        />
      ) : onboardingStep === 1 ? (
        <OnboardingOneScreen onNext={() => setOnboardingStep(2)} />
      ) : onboardingStep === 2 ? (
        <OnboardingTwoScreen
          onBack={() => setOnboardingStep(1)}
          onNext={() => setOnboardingStep(3)}
        />
      ) : (
        <OnboardingThreeScreen
          onBack={() => setOnboardingStep(2)}
          onFinish={() => setIsRoleSelectionVisible(true)}
        />
      )}
    </SafeAreaProvider>
  );
}
