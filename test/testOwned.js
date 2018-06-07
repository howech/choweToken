const Owned = artifacts.require("Owned");
const ChoweToken = artifacts.require("ChoweToken");

contract('Owned', accounts => {
  const [alice, bob, charley, david, earl, 
         frank, george, harison, ian, john ] = accounts;
  let owned;

  beforeEach( async () => {
    owned = await ChoweToken.new()
  });

  it('should start with correct ownership', async() => {
    assert.equal(alice, await owned.owner(), 'should be owned by alice')
    assert.equal(0, await owned.newOwner(), 'should not have a new owner')
  });

  it("allow only the owner can transfer ownership", async () => {
    try {
      await owned.transferOwnership(alice, {from: bob})
      assert.fail('should have been an error')
    } catch (e) {

    }

    try {
      await owned.transferOwnership(0, {from: bob})
      assert.fail('should have been an error')
    } catch (e) {

    }
    assert.equal(1,1,'yay')

  });

  it("allow alice to transfer to bob", async () => {
    await owned.transferOwnership(bob, {from: alice})
    assert.equal(alice, await owned.owner(), 'should be owned by alice')
    assert.equal(bob, await owned.newOwner(), 'bob should be the new owner')
  });

  it("allow alice to transfer to bob and he accepts", async () => {
    await owned.transferOwnership(bob, {from: alice})
    assert.equal(bob, await owned.newOwner(), 'bob should be new owner')
    const result = await owned.acceptOwnership({from:bob})

    assert.equal(result.logs[0].event, "OwnershipTransferred");
    assert.equal(result.logs[0].args._to, bob);
    assert.equal(result.logs[0].args._from, alice);

    assert.equal(bob, await owned.owner(), 'should be owned by bob')
    assert.equal(0, await owned.newOwner(), 'should be no new owner')
  });

  it("allow alice to transfer to bob and he rejects", async () => {
    await owned.transferOwnership(bob, {from: alice})
    await owned.rejectOwnership({from:bob})
    assert.equal(alice, await owned.owner(), 'should be owned by alice')
    assert.equal(0, await owned.newOwner(), 'should be no new owner')
  });

  it("should not allow non-new owner to accept or reject ownership", async () => {
    await owned.transferOwnership(bob, {from: alice})
    assert.equal(alice, await owned.owner(), 'should be owned by alice')
    assert.equal(bob, await owned.newOwner(), 'bob should be the new owner')
    try {
      await owned.acceptOwnership({from: charley})
      assert.fail('should have raised an exception')
    } catch (e) {
    }
    try {
      await owned.acceptOwnership({from: charley})
      assert.fail('should have raised an exception')
    } catch (e) {
    }

  });

  it("should allow alice to disown and then have cold feet ", async () => {
    const disownResult = await owned.disown({from: alice})
    assert.equal(disownResult.logs[0].event, "OwnershipTransferred");
    assert.equal(disownResult.logs[0].args._to, 0, 'expected transfer to 0');
    assert.equal(disownResult.logs[0].args._from, alice), 'expected transfer from alice';

    assert.equal(0, await  owned.owner(), 'there should be no owner')
    assert.equal(alice, await owned.newOwner(), 'alice can take it back or reject')
    
    const result = await owned.acceptOwnership({from: alice})
    assert.equal(result.logs[0].event, "OwnershipTransferred");
    assert.equal(result.logs[0].args._to, alice);
    assert.equal(result.logs[0].args._from, 0);

    assert.equal(alice, await owned.owner(), 'alice should be owner')
    assert.equal(0, await owned.newOwner(), 'there should be no new owner')   
  })

  it("should allow alice to disown and then commit", async () => {
    await owned.disown({from: alice})
    assert.equal(0, await  owned.owner(), 'there should be no owner')
    assert.equal(alice, await owned.newOwner(), 'alice can take it back or reject')
    await owned.rejectOwnership({from: alice})
    assert.equal(0, await owned.owner(), 'there should be no owner')
    assert.equal(0, await owned.newOwner(), 'there should be no new owner')   
  })

  it("should allow alice to offer ownership to bob, then charley and then rescind", async () => {
    await owned.transferOwnership(bob, {from: alice})
    assert.equal(bob, await owned.newOwner())
    await owned.transferOwnership(charley, {from: alice})
    assert.equal(charley, await owned.newOwner())
    await owned.transferOwnership(0, {from: alice})
    assert.equal(0, await owned.newOwner())
  })

});