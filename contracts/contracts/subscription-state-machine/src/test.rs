#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String};

#[test]
fn test_create_subscription() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    let subscription = client.create_subscription(&subscription_id);

    assert_eq!(subscription.id, subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Active);
    assert_eq!(subscription.created_at, subscription.updated_at);
}

#[test]
fn test_get_subscription() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    let subscription = client.get_subscription(&subscription_id).unwrap();
    assert_eq!(subscription.id, subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Active);

    // Test non-existent subscription
    let non_existent = String::from_str(&env, "sub_999");
    assert!(client.get_subscription(&non_existent).is_none());
}

#[test]
fn test_transition_active_to_pending_renewal() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    let subscription = client.transition_to_pending_renewal(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::PendingRenewal);
}

#[test]
fn test_transition_active_to_paused() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    let subscription = client.transition_to_paused(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Paused);
}

#[test]
fn test_transition_active_to_canceled() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    let subscription = client.transition_to_canceled(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Canceled);
}

#[test]
fn test_transition_pending_renewal_to_active() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);

    let subscription = client.complete_renewal(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Active);
}

#[test]
fn test_transition_pending_renewal_to_failed() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);

    let subscription = client.transition_to_failed(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Failed);
}

#[test]
fn test_transition_pending_renewal_to_paused() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);

    let subscription = client.transition_to_paused(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Paused);
}

#[test]
fn test_transition_pending_renewal_to_canceled() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);

    let subscription = client.transition_to_canceled(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Canceled);
}

#[test]
fn test_transition_paused_to_active() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_paused(&subscription_id);

    let subscription = client.resume_from_paused(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Active);
}

#[test]
fn test_transition_paused_to_canceled() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_paused(&subscription_id);

    let subscription = client.transition_to_canceled(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Canceled);
}

#[test]
fn test_transition_failed_to_pending_renewal() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);
    client.transition_to_failed(&subscription_id);

    let subscription = client.retry_from_failed(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::PendingRenewal);
}

#[test]
fn test_transition_failed_to_canceled() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);
    client.transition_to_failed(&subscription_id);

    let subscription = client.transition_to_canceled(&subscription_id);
    assert_eq!(subscription.state, SubscriptionState::Canceled);
}

// Invalid transition tests

#[test]
#[should_panic(expected = "Invalid state transition")]
fn test_invalid_transition_active_to_failed() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    // This should panic - cannot go directly from ACTIVE to FAILED
    client.transition_to_failed(&subscription_id);
}

#[test]
#[should_panic(expected = "Invalid state transition")]
fn test_invalid_transition_paused_to_pending_renewal() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_paused(&subscription_id);

    // This should panic - cannot go from PAUSED to PENDING_RENEWAL
    client.transition_to_pending_renewal(&subscription_id);
}

#[test]
#[should_panic(expected = "Invalid state transition")]
fn test_invalid_transition_failed_to_active() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_pending_renewal(&subscription_id);
    client.transition_to_failed(&subscription_id);

    // This should panic - cannot go directly from FAILED to ACTIVE
    client.complete_renewal(&subscription_id);
}

#[test]
#[should_panic(expected = "Invalid state transition")]
fn test_invalid_transition_paused_to_failed() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_paused(&subscription_id);

    // This should panic - cannot go from PAUSED to FAILED
    client.transition_to_failed(&subscription_id);
}

#[test]
#[should_panic(expected = "Cannot transition from CANCELED state")]
fn test_invalid_transition_from_canceled() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);
    client.transition_to_canceled(&subscription_id);

    // This should panic - CANCELED is a terminal state
    client.transition_to_paused(&subscription_id);
}

#[test]
#[should_panic(expected = "Already in target state")]
fn test_invalid_transition_same_state() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    client.create_subscription(&subscription_id);

    // This should panic - already in ACTIVE state
    client.complete_renewal(&subscription_id);
}

#[test]
#[should_panic(expected = "Subscription not found")]
fn test_transition_nonexistent_subscription() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_999");

    // This should panic - subscription doesn't exist
    client.transition_to_paused(&subscription_id);
}

#[test]
fn test_complex_state_flow() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");

    // Create -> Active
    let sub = client.create_subscription(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Active);

    // Active -> PendingRenewal
    let sub = client.transition_to_pending_renewal(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::PendingRenewal);

    // PendingRenewal -> Failed
    let sub = client.transition_to_failed(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Failed);

    // Failed -> PendingRenewal (retry)
    let sub = client.retry_from_failed(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::PendingRenewal);

    // PendingRenewal -> Active (successful renewal)
    let sub = client.complete_renewal(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Active);

    // Active -> Paused
    let sub = client.transition_to_paused(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Paused);

    // Paused -> Active (resume)
    let sub = client.resume_from_paused(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Active);

    // Active -> Canceled
    let sub = client.transition_to_canceled(&subscription_id);
    assert_eq!(sub.state, SubscriptionState::Canceled);
}

#[test]
fn test_multiple_subscriptions() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let sub1_id = String::from_str(&env, "sub_001");
    let sub2_id = String::from_str(&env, "sub_002");

    let sub1 = client.create_subscription(&sub1_id);
    let sub2 = client.create_subscription(&sub2_id);

    assert_eq!(sub1.id, sub1_id);
    assert_eq!(sub2.id, sub2_id);
    assert_eq!(sub1.state, SubscriptionState::Active);
    assert_eq!(sub2.state, SubscriptionState::Active);

    // Transition sub1 to paused
    let sub1 = client.transition_to_paused(&sub1_id);
    assert_eq!(sub1.state, SubscriptionState::Paused);

    // Sub2 should still be active
    let sub2 = client.get_subscription(&sub2_id).unwrap();
    assert_eq!(sub2.state, SubscriptionState::Active);
}

#[test]
fn test_updated_at_timestamp() {
    let env = Env::default();
    let contract_id = env.register(SubscriptionStateMachine, ());
    let client = SubscriptionStateMachineClient::new(&env, &contract_id);

    let subscription_id = String::from_str(&env, "sub_001");
    let sub1 = client.create_subscription(&subscription_id);
    let created_at = sub1.created_at;
    let updated_at1 = sub1.updated_at;

    assert_eq!(created_at, updated_at1);

    // Wait a bit (in real ledger this would advance)
    let sub2 = client.transition_to_pending_renewal(&subscription_id);
    let updated_at2 = sub2.updated_at;

    // updated_at should be >= created_at
    assert!(updated_at2 >= created_at);
    // updated_at should be >= previous updated_at
    assert!(updated_at2 >= updated_at1);
}

