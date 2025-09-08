import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { Header } from '../../components';
import { theme } from '../../theme';

const TermsnConditionsScreen = () => {
  const terms: string[] = [
    'All the auctions are subject to approval from sellers.',
    'Please bid carefully; bids once placed cannot be canceled.',
    'Only buyers whose Aadhaar is linked to PAN are eligible to participate.',
    'If Aadhaar–PAN is not linked, buyer must pay any additional tax as per IT guidelines.',
    'After depositing full and final sale amount, collect the release letter and release the vehicle from the yard within 72 hours from date of sale and payment.',
    'Parking charges are borne by the buyers.',
    'All vehicles are sold on “as-is-where-is” basis.',
    'Quote validity: 30 days or month end (whichever is earlier) for auctions between 1st–25th; till 5th of next month for auctions after the 25th.',
    'Even if a vehicle is re-auctioned, the quote will be valid till month end.',
    'Auction is post approval.',
    'In case of backout, entire or part of the security deposit may be forfeited and buyer will be blacklisted.',
    'All taxes, transfer and RTO discrepancies, if any, are solely at the bidder’s risk and responsibility.',
    'Payment: to be deposited before the 30th of every month (applicable for lockdown conditions).',
    'Physically inspect vehicles before bidding; no request for amount revision at the time of lifting will be entertained once quoted in the auction.',
    'Seller may approve or cancel approval at their discretion at any time.',
    'Vehicles once sold will not be taken back.',
    'No waiver in parking charges; RO will be provided as per seller T&C.',
    'Indus auction fees will be applicable as per predefined T&C.',
    'Payments to be collected only in non-cash mode.',
    'Auction can start at ₹1,000 base price; ensure a respectable bid amount.',
    'No additional documents will be provided. Asset will be released after reconciliation of payment.',
    'Asset release TAT is 2–3 days, subject to seller T&C.',
    'An additional 1% TCS will be collected at source on vehicles costing over ₹10 lakh.',
    'Parking charges apply from date of vehicle entry in yard till date of physical release.',
    'If the buyer does not collect the asset from the stockyard after payment, the amount may be forfeited and the seller may re-auction the assets.',
    'Buyer will be blacklisted if they use the customer’s address from VAHAN link.',
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Terms and Conditions"
        canGoBack
        type="master"
        shouldRenderRightIcon={false}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Please read these terms carefully before participating in any auction.
        </Text>
        <View style={styles.list}>
          {terms.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footerNoteContainer}>
          <Text style={styles.footerNote}>
            By continuing, you acknowledge that you have read and agree to these
            terms.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  intro: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  list: {
    gap: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  itemText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  footerNoteContainer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  footerNote: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});

export default TermsnConditionsScreen;
