import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Roboto_600SemiBold } from '@expo-google-fonts/roboto/600SemiBold';
import { Roboto_800ExtraBold } from '@expo-google-fonts/roboto/800ExtraBold';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaintenanceFlowProvider } from './components/MaintenanceFlowProvider';
import { MOCK_ACTIVE_RENTAL } from './constants/mockRentals';

import { MOCK_CONVERSATIONS } from './constants/mockChats';
import { MOCK_OWNER_CONVERSATIONS } from './constants/mockOwnerChats';
import { OwnerWorkspaceScreen } from './screens/OwnerWorkspaceScreen';
import { DriverWorkspaceScreen } from './screens/DriverWorkspaceScreen';
import type { FleetEdits } from './types/fleet';
import { MOCK_OWNER_BOOKINGS } from './constants/mockOwnerBookings';
import { initialOwnerProfile } from './types/ownerProfile';
import { initialCustomerNotificationPreferences } from './components/NotificationPreferencesSheet';
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
import type { VehicleReview } from './types/review';
import { MOCK_VEHICLE_REVIEWS } from './constants/mockReviews';
import type { Coordinate, Vehicle } from './types/map';
import type { MainTab } from './types/navigation';
import type { RentalRecord } from './types/rental';
import type { UserRole } from './types/user';
import type { UserVehicle } from './types/vehicle';

const SPLASH_DURATION_MS = 1800;
// All implemented workspaces are accessible during the UI preview.
const PREVIEW_ROLES: UserRole[] = ['renter', 'owner', 'driver'];

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
    Roboto_600SemiBold,
    Roboto_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [ownerConversations, setOwnerConversations] = useState(MOCK_OWNER_CONVERSATIONS);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [isRoleSelectionVisible, setIsRoleSelectionVisible] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen | null>(null);
  const [chatReturnScreen, setChatReturnScreen] =
    useState<'activity' | 'carDetail' | 'messages' | 'rentalDetail'>('messages');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<VehicleReview[]>(MOCK_VEHICLE_REVIEWS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [customerNotificationPreferences, setCustomerNotificationPreferences] = useState(initialCustomerNotificationPreferences);
  const [activeRole, setActiveRole] = useState<UserRole>('renter');
  // Production role onboarding/verification comes later.
  const [userRoles, setUserRoles] = useState<UserRole[]>(PREVIEW_ROLES);
  useEffect(() => {
    // Also update sessions whose state was preserved by Fast Refresh.
    setUserRoles(current => PREVIEW_ROLES.every(role => current.includes(role))
      ? current : Array.from(new Set([...current, ...PREVIEW_ROLES])));
  }, []);
  const [ownerFleetEdits, setOwnerFleetEdits] = useState<Record<string, FleetEdits>>({});
  const [ownerBookings, setOwnerBookings] = useState(MOCK_OWNER_BOOKINGS);
  const [ownerProfile, setOwnerProfile] = useState(initialOwnerProfile);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([
    ...MOCK_USER_VEHICLES,
  ]);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [selectedRental, setSelectedRental] = useState<RentalRecord>();
  const [discoverCategory, setDiscoverCategory] = useState<import('./types/navigation').DiscoverCategory>('Cars');
  const [rentalDetailReturnScreen, setRentalDetailReturnScreen] = useState<'home' | 'activity'>('activity');
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
    (request) => request.vehicle.id === selectedVehicle?.id && request.status === 'pending',
  );
  const unreadMessagesCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  const navigateToMainTab = (tab: MainTab) => {
    if (tab === 'discover') setDiscoverCategory('Cars');
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

  const switchWorkspace = (role: UserRole) => {
    setActiveRole(role);
    setAuthScreen('home');
  };

  const openConversation = (
    conversationId: string,
    returnScreen: 'activity' | 'carDetail' | 'messages' | 'rentalDetail' = 'messages',
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
    owner = false,
  ) => {
    const updateConversations = owner ? setOwnerConversations : setConversations;
    updateConversations((current) =>
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

  const sendMessage = (conversationId: string, text: string, owner = false) => {
    const messageId = `local-${Date.now()}`;
    const participantOnline = (owner ? ownerConversations : conversations).find(
      ({ id }) => id === conversationId,
    )?.participant.isOnline;

    const updateConversations = owner ? setOwnerConversations : setConversations;
    updateConversations((current) =>
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
      () => updateMessageStatus(conversationId, messageId, 'delivered', owner),
      450,
    );
    messageStatusTimersRef.current.push(deliveredTimer);

    if (participantOnline) {
      const readTimer = setTimeout(
        () => updateMessageStatus(conversationId, messageId, 'read', owner),
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
      <MaintenanceFlowProvider rentals={[MOCK_ACTIVE_RENTAL]} onOpenActivity={() => setAuthScreen('activity')}>
      {isSplashVisible || (!fontsLoaded && !fontError) ? (
        <SplashScreen />
      ) : activeRole === 'driver' && authScreen === 'home' ? (
        <DriverWorkspaceScreen enabledRoles={userRoles} onRoleChange={switchWorkspace} onLogout={() => setAuthScreen('welcome')} />
      ) : activeRole === 'owner' && authScreen === 'home' ? (
        <OwnerWorkspaceScreen
          bookings={ownerBookings}
          ownerProfile={ownerProfile} onOwnerProfileChange={setOwnerProfile}
          onBookingStatusChange={(id, status) => setOwnerBookings(current => current.map(booking => booking.id === id && booking.status === 'Requested' ? { ...booking, status, payment: status === 'Confirmed' ? 'Awaiting payment' : 'No payment collected' } : booking))}
          fleetEdits={ownerFleetEdits} onEditVehicle={(id, edits) => setOwnerFleetEdits(current => ({ ...current, [id]: edits }))} savedVehicles={userVehicles.filter(vehicle => vehicle.relationship === 'fleet' && vehicle.id.startsWith('owner-vehicle-'))} conversations={ownerConversations} onReadConversation={id => setOwnerConversations(current => current.map(item => item.id === id ? { ...item, unreadCount: 0 } : item))} onSendMessage={(id, text) => sendMessage(id, text, true)} enabledRoles={userRoles} onRoleChange={switchWorkspace} onLogout={() => setAuthScreen('welcome')} onSaveVehicle={(values) => setUserVehicles(current => [...current, { ...values, id: `owner-vehicle-${Date.now()}`, ownerUserId: 'current-user', relationship: 'fleet', status: 'pending_verification', documents: values.documents ?? [] }])} />
      ) : authScreen === 'carDetail' &&
        selectedVehicle &&
        selectedVehicleOrigin ? (
        <CarDetailScreen
          onOpenActivity={() => setAuthScreen('activity')}
          reviews={vehicleReviews.filter((review) => review.vehicleId === selectedVehicle.id)}
          onSaveReview={(input) => {
            const review: VehicleReview = {
              ...input,
              id: `${selectedVehicle.id}-your-review`,
              vehicleId: selectedVehicle.id,
              author: 'You',
              isOwn: true,
              createdAt: new Date().toISOString(),
            };
            setVehicleReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
          }}
          bookingRequest={selectedVehicleBookingRequest}
          onBack={() => setAuthScreen(vehicleDetailReturnScreen)}
          onBookingRequestCanceled={(requestId) =>
            setBookingRequests((current) =>
              current.map((request) => request.id === requestId ? { ...request, status: 'canceled' as const } : request),
            )
          }
          onBookingRequestSubmitted={(request) =>
            setBookingRequests((current) => [
              ...current.filter(
                (currentRequest) =>
                  currentRequest.vehicle.id !== request.vehicle.id || currentRequest.status === 'canceled',
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
          category={discoverCategory}
          onCategoryChange={setDiscoverCategory}
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
          onBack={() => setAuthScreen(rentalDetailReturnScreen)}
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
          requests={bookingRequests}
          onCancelRequest={(id) => setBookingRequests((current) => current.map((request) => request.id === id ? { ...request, status: 'canceled' as const } : request))}
          onMessageOwner={() => openConversation('chat-owner-munoh', 'activity')}
          onOpenRental={(rental) => {
            setSelectedRental(rental);
            setRentalDetailReturnScreen('activity');
            setAuthScreen('rentalDetail');
          }}
          onTabPress={navigateToMainTab}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : authScreen === 'profile' ? (
        <ProfileScreen
          activeRole={activeRole}
          enabledRoles={userRoles}
          notificationPreferences={customerNotificationPreferences}
          onSaveNotificationPreferences={setCustomerNotificationPreferences}
          onLogout={() => setAuthScreen('welcome')}
          onOpenGarage={() => setAuthScreen('garage')}
          onRoleChange={switchWorkspace}
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
          onOpenService={(category) => {
            setDiscoverCategory(category);
            setAuthScreen('discover');
          }}
          onOpenRental={(rental) => {
            setSelectedRental(rental);
            setRentalDetailReturnScreen('home');
            setAuthScreen('rentalDetail');
          }}
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
            setUserRoles(Array.from(new Set<UserRole>([...roles, ...PREVIEW_ROLES])));
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
      </MaintenanceFlowProvider>
    </SafeAreaProvider>
  );
}
