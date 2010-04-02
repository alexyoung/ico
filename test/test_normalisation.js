if (typeof load != 'undefined') {
  load('riot/riot.js');
  load('../ico.js');
}

Riot.run(function() {
  context('Ico.Normaliser', function() {
    given('values between 0 and 1', function() {
      var normaliser = new Ico.Normaliser([0.1, 0.5, 0.9, 1.0]);
      should('have a step of 0.1', normaliser.step).equals(0.1); 
      should('have a start value of 0', normaliser.start_value).equals(0); 
    });

    given('very small numbers', function() {
      var normaliser = new Ico.Normaliser([0.9999, 0.994, 0.93, 0.92]);
      should('have a step of 0.1', normaliser.step).equals(0.01); 
      should('have a start value of 0.92', normaliser.start_value).equals(0.92); 
    });

    given('a normaliser with a default start value', function() {
      var normaliser = new Ico.Normaliser([1095, 1099, 1100, 1096], { start_value: 0 });
      should('have a step of 100', normaliser.step).equals(100);
      should('have a the specified start value', normaliser.start_value).equals(0);
    });

    given('values between 1 and 33', function() {
      var normaliser = new Ico.Normaliser([10, 9, 3, 30, 1, 10, 5, 33, 33]);
      should('have a step of 10', normaliser.step).equals(10);
    });

    given('a large range of negative values', function() {
      var normaliser = new Ico.Normaliser([-57,-31,-87,66,-30,-77,-88,-75,-20,-48,-56,-91,16,-41,-87,-69,-65,-62,58,-15,-49,-75,-42,-78,-79]);
      should('have a step of 10', normaliser.step).equals(10);
      should('set the min to the lowest value', normaliser.min).equals(-91);
      should('round the start value to a lower value', normaliser.start_value).equals(-100);
    });

    given('a negative range range where the last value is a multiple of 5', function() {
      var normaliser = new Ico.Normaliser([10, 10, 10, 10, 10, 10, 5, 6, 9, 11, 14, -25]);
      should('have the expected step', normaliser.step).equals(10);
      should('have the expected min', normaliser.min).equals(-25);
      should('have the expected start', normaliser.start_value).equals(-30);
    });

    given('a set of the same values', function() {
      var normaliser = new Ico.Normaliser([20, 20], { start_value: 0 });
      should('have the expected step', normaliser.step).equals(1);
      should('have the expected start', normaliser.start_value).equals(0);
    });

    given('floating point numbers with a range of about 20', function() {
      var normaliser = new Ico.Normaliser([100.3, 100.4, 101.3, 100.4, 101.2, 101.8, 102.0, 103.5, 103.7, 103.1, 104.1, 103.0, 102.6, 104.2, 104.1, 103.3, 103.9, 104.6, 103.4, 104.5, 103.5, 103.6, 104.6, 104.4, 104.5, 103.7, 103.8, 102.9, 102.5, 102.3, 101.8, 103.1, 102.0, 100.8, 100.4, 100.3, 100.7, 100.7, 101.3, 101.6, 102.6, 98.0, 100.1, 100.8, 100.7, 100.3, 100.1, 100.9, 99.2, 100.1, 99.8, 99.9, 99.8, 99.3, 100.1, 100.2, 99.5, 99.8, 99.7, 100.8, 100.7, 100.0, 101.2, 101.2, 100.7, 101.3, 102.0, 101.6, 101.4, 101.1, 101.4, 100.3, 100.2, 100.6, 99.8, 100.0, 101.1, 100.6, 100.8, 100.3, 100.2, 100.7, 99.6, 100.2, 100.4, 100.4, 100.5, 100.3, 99.6, 99.5, 99.1, 98.3, 99.0, 99.1, 99.6, 100.2, 100.6, 100.3, 101.2, 100.0, 100.5, 100.4, 100.6, 100.1, 100.7, 100.7, 101.2, 100.3, 100.6, 100.3, 100.1, 100.5, 100.2, 99.8, 100.3, 100.5, 101.1, 101.5, 101.5, 101.2, 101.1, 100.9, 100.8, 101.4, 101.2, 101.3, 101.2, 100.9, 101.0, 100.6, 100.6, 99.9, 99.8, 99.5, 98.8, 98.6]);
      should('have the right start value', normaliser.start_value).equals(90);

    });
  });
});
