const ChoweToken = artifacts.require("ChoweToken");

contract('ChoweToken', accounts => {
  const [alice, bob, charley, david, earl, 
         frank, george, harison, ian, john ] = accounts;

  let Chowe;

  beforeEach( async() => {
    Chowe = await ChoweToken.new()
  })

  it("should put 1 Chowe in the first account", async () => {
    const balance = await Chowe.balanceOf(alice);
    assert.equal(balance.valueOf(), 1, "alice should have 1 on create");
  });

  it("should send coin correctly", async () => {
    const b1p = Chowe.balanceOf(alice)
    const b2p = Chowe.balanceOf(bob)
    const supplyp = Chowe.totalSupply()

    const [b1,b2,supply] = await Promise.all([b1p,b2p,supplyp])
    
    assert.equal(b1.toNumber(), 1, 'alice should have 1 Chowe')
    assert.equal(b2.toNumber(), 0, 'bob should have 0 Chowe')  
        
    const result = await Chowe.transfer(bob, 1, {from: alice})
    
    const b1xp = Chowe.balanceOf(alice)
    const b2xp = Chowe.balanceOf(bob)
    const supplyxp = Chowe.totalSupply()
    const [b1x, b2x, supplyx] = await Promise.all([b1xp,b2xp,supplyxp])
    
    assert.equal(b1x.toNumber(), 1, 'alice should still have 1 Chowe')
    assert.equal(b2x.toNumber(), 1, 'bob should have 1 Chowe')
    assert.equal(supplyx.toNumber(), supply.toNumber() + 1, 'a token should have been created')

    const destroyResult = await Chowe.transfer(0, 1, {from: bob})
    const b2zp = Chowe.balanceOf(bob)
    const supplyzp = Chowe.totalSupply()
    const [b2z,supplyz] = await Promise.all([b2zp, supplyp])

    assert.equal(b2z, 0, 'bob should have 0 Chowe')
    assert.equal(supply, supplyz, 'total should be back to the start')
  });

  it("should fail when sending a second coin", async () => {
    // Get initial balances of first and second account.        
    const result1 = await Chowe.transfer(bob, 1, {from: alice})
    try {
      const result2 = await Chowe.transfer(bob, 1, {from: alice})
      assert.fail('should have raised an exception')
    } catch (e) {
      assert.equal('VM Exception while processing transaction: revert', e.message, 'second call should fail')
    }
  });

  it("should support allowances", async () => {
    const pr1 = Chowe.approve(bob, 10, {from: alice})
    const pr2 = Chowe.approve(charley, 3, {from: alice})
    const pr3 = Chowe.approve(david, 5, {from: bob})

    const [r1,r2,r3] = await Promise.all([pr1,pr2,pr3])

    const al1 = await Chowe.allowance(alice, bob)
    const al2 = await Chowe.allowance(alice, charley)
    const al3 = await Chowe.allowance(bob, david)

    assert.equal(10, al1.toNumber(), 'bob should be allowed 10 from alice')
    assert.equal(3, al2.toNumber(), 'bob should be allowed 10 from alice')
    assert.equal(5, al3.toNumber(), 'bob should be allowed 10 from alice')
  })

  it("should let transferFrom work", async () => {
    const r1 = await Chowe.approve(bob, 5, {from: alice})

    await Chowe.transferFrom(alice, bob, 1, {from: bob})
    await Chowe.transferFrom(alice, charley, 1, {from: bob})
    await Chowe.transferFrom(alice, david, 1, {from: bob})
    await Chowe.transferFrom(alice, earl, 1, {from: bob})
    await Chowe.transferFrom(alice, frank, 1, {from: bob})

    const balances = await Promise.all([alice, bob, charley, david, earl, frank].map( x => Chowe.balanceOf(x) ))

    balances.forEach( b => {
      assert.equal(1, b.toNumber(), 'alice, bob, charley, david, earl, and frank should each have 1 Chowe')
    })

  })

  it("should block transferFrom when not allowed", async () => {
    const r1 = await Chowe.approve(bob, 1, {from: alice})

    await Chowe.transferFrom(alice, bob, 1, {from: bob})
    const remaining = await Chowe.allowance(alice, bob)
    assert.equal(0,remaining.toNumber(), "bob's alowance from alice should be 0")
    try {
      await Chowe.transferFrom(alice, charley, 1, {from: bob})
      assert.fail('bob should not be able to send coin to charley')
    } catch(e) {
      //should be here
    }

    const balances = await Promise.all([alice, bob, charley, david, earl].map( x => Chowe.balanceOf(x) ))

    assert.equal(1, balances[0].toNumber(), 'alice should each have 1 Chowe')
    assert.equal(1, balances[1].toNumber(), 'bob should each have 1 Chowe')
    assert.equal(0, balances[2].toNumber(), 'charley should each have 0 Chowe')

  })

  it("should emit transfer messages", async () => {
    const transferResult = await Chowe.transfer(bob, 1, {from: alice})
    let transfer = transferResult.logs[0]
    let args = transfer.args
    assert.equal(transfer.event, "Transfer")
    assert.equal(alice, args.from, 'should be from alice')
    assert.equal(bob, args.to, 'should be to bob')
    assert.equal(1, args.tokens.toNumber(), 'should be 1 Chowe')

    const approveResult  = await Chowe.approve(bob, 1, {from: alice})
    let approve = approveResult.logs[0]
    args = approve.args
    assert.equal(approve.event, "Approval")
    assert.equal(alice, args.tokenOwner, 'tokenOwner should be alice')
    assert.equal(bob, args.spender, 'spender should be bob')
    assert.equal(1, args.tokens.toNumber(), 'should be 1 Chowe')

    const transferResult2 = await Chowe.transferFrom(alice, charley, 1, {from: bob})
    transfer = transferResult2.logs[0]
    args = transfer.args
    assert.equal(transfer.event, "Transfer")
    assert.equal(alice, args.from, 'should be from alice')
    assert.equal(charley, args.to, 'should be to charley')
    assert.equal(1, args.tokens.toNumber(), 'should be 1 Chowe')
  })

  it("should should keep the balance of the null account at zero", async () => {
    assert.equal(0, (await Chowe.balanceOf(0)).toNumber(), 'null address should never have Chowes')
    await Chowe.transfer(0,1, {from: alice})
    assert.equal(0, (await Chowe.balanceOf(bob)).toNumber(), 'null address should never have Chowes')
  })

  it("should ensure that the new owner has a coin", async () => {
    await Chowe.transferOwnership(bob, {from: alice})
    assert.equal(0, (await Chowe.balanceOf(0)).toNumber(), 'bob should still have no Chowe')
    const result = await Chowe.acceptOwnership({from: bob})
    assert.equal(result.logs[0].event, "OwnershipTransferred");
    assert.equal(result.logs[0].args._to, bob, 'expected transfer to 0');
    assert.equal(result.logs[0].args._from, alice), 'expected transfer from alice';

    assert.equal(result.logs[1].event, "Transfer");
    assert.equal(result.logs[1].args.to, bob, 'expected transfer to bob');
    assert.equal(result.logs[1].args.from, alice, 'expected transfer from alice');
    assert.equal(result.logs[1].args.tokens.toNumber(), 1, 'expected transfer from alice');

    assert.equal(1, (await Chowe.balanceOf(bob)).toNumber(), 'bob should have gotten a coin in the transfer')
    assert.equal(2, (await Chowe.totalSupply()).toNumber(), 'the total supply should now be 2')
  })

  it("should not give a coin to 0 when disowning", async () => {
    await Chowe.disown({from: alice})
    assert.equal(1, (await Chowe.totalSupply()).toNumber(), 'the total supply still be 1')
  })

});