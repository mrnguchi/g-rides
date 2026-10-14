import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, layout } from '../theme';
import type { ReviewInput, VehicleReview } from '../types/review';
import { AppIcon } from './AppIcon';

const star = require('../../assets/images/star (1).png');
function Stars({ rating }: { rating: number }) {
  return <View accessible accessibilityLabel={`${rating} out of 5 stars`} style={styles.stars}>
    {[1, 2, 3, 4, 5].map((value) => <Image key={value} source={star} style={[styles.star, { tintColor: value <= rating ? colors.warning : colors.borderGray }]} />)}
  </View>;
}

export function VehicleReviews({ reviews, carName, onSave }: {
  reviews: VehicleReview[]; carName: string; onSave: (input: ReviewInput) => void;
}) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ownReview = reviews.find((review) => review.isOwn);
  useEffect(() => {
    if (sheetVisible) { setRating(ownReview?.rating ?? 0); setComment(ownReview?.comment ?? ''); setError(''); }
  }, [sheetVisible, ownReview]);
  const save = () => {
    if (!rating) { setError('Choose a star rating.'); return; }
    if (comment.trim().length < 10) { setError('Please write at least 10 characters about your experience.'); return; }
    onSave({ rating, comment: comment.trim() });
    setSheetVisible(false);
  };
  return <View style={styles.section}>
    <View style={styles.headingRow}>
      <View><Text style={styles.heading}>Customer reviews</Text><Text style={styles.count}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Text></View>
      <Pressable accessibilityRole="button" onPress={() => setSheetVisible(true)} style={({ pressed }) => [styles.leaveButton, pressed && styles.pressed]}><AppIcon name="edit" size={16} color={colors.primaryBrandBlue} /><Text style={styles.leaveText}>{ownReview ? 'Edit your review' : 'Leave review'}</Text></Pressable>
    </View>
    <View style={styles.reviewList}>
      {reviews.length ? reviews.map((review) => <View key={review.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}><Text style={styles.initials}>{review.author.split(' ').map((word) => word[0]).slice(0, 2).join('')}</Text></View>
          <View style={styles.identity}><Text style={styles.author}>{review.isOwn ? 'You' : review.author}</Text><Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></View>
          <Stars rating={review.rating} />
        </View>
        <Text style={styles.comment}>{review.comment}</Text>
      </View>) : <View style={styles.empty}><Text style={styles.author}>No reviews yet</Text><Text style={styles.comment}>Share your experience with this car.</Text></View>}
    </View>

    <Modal visible={sheetVisible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => setSheetVisible(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close review form" style={styles.backdrop} onPress={() => setSheetVisible(false)} />
        <View accessibilityViewIsModal style={[styles.sheet, { maxHeight: height - insets.top - 20, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}><View style={styles.identity}><Text style={styles.sheetTitle}>{ownReview ? 'Edit your review' : 'Leave a review'}</Text><Text style={styles.carName}>{carName}</Text></View><Pressable accessibilityLabel="Close review form" accessibilityRole="button" hitSlop={8} onPress={() => setSheetVisible(false)} style={styles.closeButton}><AppIcon name="close" size={21} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            <Text style={styles.label}>How was your experience?</Text>
            <View style={styles.ratingInput}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} ${value === 1 ? 'star' : 'stars'}`} accessibilityState={{ selected: rating === value }} onPress={() => { setRating(value); setError(''); }} style={styles.starButton}><Image source={star} style={[styles.largeStar, { tintColor: value <= rating ? colors.warning : colors.borderGray }]} /></Pressable>)}</View>
            <Text style={styles.ratingCaption}>{rating ? `${rating} out of 5` : 'Tap to rate'}</Text>
            <Text style={styles.label}>Your review</Text>
            <TextInput accessibilityLabel="Your review" value={comment} onChangeText={(value) => { setComment(value); setError(''); }} placeholder="Tell us about the car, pickup, and your experience with the owner..." placeholderTextColor={colors.textSecondary} multiline maxLength={1000} textAlignVertical="top" style={styles.input} />
            <Text style={styles.characterCount}>{comment.length}/1000</Text>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          </ScrollView>
          <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveText}>Save review</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: layout.screenGutter, paddingTop: 22 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  heading: { color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 15 },
  count: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 5 },
  leaveButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EDF4FE', paddingHorizontal: 13, borderRadius: 21 },
  leaveText: { fontFamily: fonts.medium, color: colors.primaryBrandBlue, fontSize: 13 },
  reviewList: { gap: 14, paddingBottom: 8 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#E8EBF0', backgroundColor: colors.white, padding: 16, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.045, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EDF4FE', justifyContent: 'center', alignItems: 'center' },
  initials: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primaryBrandBlue },
  identity: { flex: 1 },
  author: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 14 },
  date: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12, marginTop: 5 },
  stars: { flexDirection: 'row', gap: 2 },
  star: { width: 12, height: 12, resizeMode: 'contain' },
  comment: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, lineHeight: 22, marginTop: 14 },
  empty: { padding: 24, borderRadius: 16, backgroundColor: colors.backgroundLight },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.4)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: layout.screenGutter },
  handle: { width: 40, height: 4, backgroundColor: colors.borderGray, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  sheetTitle: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 21 },
  carName: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 6 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundLight },
  form: { paddingBottom: 12 },
  label: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 14, marginBottom: 12 },
  ratingInput: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  starButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  largeStar: { width: 31, height: 31, resizeMode: 'contain' },
  ratingCaption: { fontFamily: fonts.regular, color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 6, marginBottom: 25 },
  input: { minHeight: 130, backgroundColor: colors.backgroundLight, borderWidth: 1, borderColor: colors.borderGray, borderRadius: 14, padding: 14, fontFamily: fonts.regular, color: colors.textPrimary, fontSize: 14, lineHeight: 22 },
  characterCount: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 7 },
  error: { color: colors.error, fontFamily: fonts.medium, fontSize: 13, marginTop: 10 },
  saveButton: { minHeight: 48, backgroundColor: colors.primaryBrandBlue, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { fontFamily: fonts.semiBold, color: colors.white, fontSize: 15 },
  pressed: { opacity: 0.7 },
});
